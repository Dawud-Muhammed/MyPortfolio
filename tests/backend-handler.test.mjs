import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {createAssistantHandler} from '../api/assistant.js';

class Response extends EventEmitter {
 constructor(){super();this.headers={};}
 setHeader(k,v){this.headers[k]=v;}
 status(s){this.statusCode=s;return this;}
 json(v){this.body=v;this.writableEnded=true;return this;}
}
const env={ASSISTANT_ENABLED:'true',ASSISTANT_PRICING_VERIFIED:'2026-11-05',OPENAI_API_KEY:'test-key-never-sent',
 ASSISTANT_SESSION_SECRET:'test-only-session-secret-longer-than-32',SITE_URL:'https://portfolio.example',NODE_ENV:'production'};
function fixture(options={}) {
 const rpcCalls=[];let providerCalls=0;let revisionCalls=0;
 const db={from:()=>({select(){return this;},eq(){return this;},single:async()=>({data:{enabled:options.enabled ?? true}})}),
  rpc:async(name,args)=>{rpcCalls.push({name,args});return name==='reserve_assistant_budget'
   ? {data:options.reservation || {ok:true,id:'reservation-test'},error:options.meterFailure || null}:{error:null};}};
 class Provider {
  constructor(){this.responses={create:async(body,{signal})=>{
   providerCalls++;assert.equal(body.store,false);assert.equal(body.reasoning.effort,'none');assert.equal(body.tools,undefined);
   if(options.cancel){options.res.emit('close');assert(signal.aborted);throw new DOMException('Aborted','AbortError');}
   if(options.providerError)throw new Error('Simulated provider failure');
   return {id:'response-test',output_text:JSON.stringify({answer:'He built an API.',source_ids:['project:one','evil']}),usage:{input_tokens:100,output_tokens:20}};
  }};}
 }
 const handler=createAssistantHandler({env:{...env,...options.env},database:()=>db,OpenAI:Provider,
  revision:async()=>{revisionCalls++;return options.changeContent && revisionCalls===3?'2':'1';},
  loadKnowledge:async()=>({projects:options.noKnowledge?[]:[{id:'one',slug:'test',title:'Test',role:'API developer',publication_status:'published',assistant_eligible:true}]}),
 });
 return {handler,rpcCalls,get providerCalls(){return providerCalls;}};
}
const request=()=>({method:'POST',headers:{origin:'https://portfolio.example','content-type':'application/json'},body:{message:'What did he build?'},socket:{remoteAddress:'127.0.0.1'}});
test('no-key and disabled requests never reserve or contact provider',async()=>{
 for(const option of [{env:{OPENAI_API_KEY:''}},{enabled:false},{env:{ASSISTANT_ENABLED:'false'}},{env:{ASSISTANT_PRICING_VERIFIED:''}}]){
  const f=fixture(option),res=new Response();await f.handler(request(),res);
  assert.equal(res.body.code,'disabled');assert.equal(f.providerCalls,0);assert.equal(f.rpcCalls.length,0);
 }
});
test('missing eligible knowledge gives a free contact fallback',async()=>{
 const f=fixture({noKnowledge:true}),res=new Response();await f.handler(request(),res);
 assert.equal(res.statusCode,200);assert.equal(res.body.sources[0].url,'/contact');assert.equal(f.providerCalls,0);
});
test('rate limits, budget exhaustion and unavailable metering fail before provider calls',async()=>{
 for(const option of [{reservation:{ok:false,code:'rate_limited'}},{reservation:{ok:false,code:'budget_exhausted'}},{meterFailure:{message:'offline'}}]){
  const f=fixture(option),res=new Response();await f.handler(request(),res);
  assert(res.statusCode>=400);assert.equal(f.providerCalls,0);
 }
});
test('provider failures retain full reservation, no raw provider details exposed',async()=>{
 const f=fixture({providerError:true}),res=new Response();await f.handler(request(),res);
 assert.equal(res.statusCode,503);assert.equal(f.providerCalls,1);
 assert.equal(f.rpcCalls.at(-1).args.p_actual,null);
 assert(!JSON.stringify(res.body).includes('Simulated'));
});
test('cancellation aborts provider and retains unknown cost',async()=>{
 const res=new Response(),f=fixture({cancel:true,res});await f.handler(request(),res);
 assert.equal(f.providerCalls,1);assert.equal(f.rpcCalls.at(-1).args.p_actual,null);
});
test('successful answer reconciles usage and exposes only approved links',async()=>{
 const f=fixture(),res=new Response();await f.handler(request(),res);
 assert.equal(res.statusCode,200);assert.equal(res.body.sources.length,1);assert.equal(res.body.sources[0].url,'/projects/test');
 assert.equal(f.rpcCalls.at(-1).args.p_actual,23);assert.equal(res.headers['Cache-Control'],'private, no-store, max-age=0');
});
test('unpublishing while a model runs suppresses the whole stale answer',async()=>{
 const f=fixture({changeContent:true}),res=new Response();await f.handler(request(),res);
 assert.equal(res.statusCode,409);assert.equal(res.body.code,'content_changed');assert.equal(res.body.answer,undefined);
});
