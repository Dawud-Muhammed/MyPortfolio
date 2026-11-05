import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {createAssistantHandler,assistantReadiness} from '../api/assistant.js';
import {readConfig} from '../server/assistant-core.mjs';

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
test('same-origin chat on a custom domain works with a stale canonical URL; foreign requests never spend',async()=>{
 const f=fixture(),res=new Response(),req=request();
 req.headers={...req.headers,origin:'https://dawud.pro.et',host:'dawud.pro.et','sec-fetch-site':'same-origin'};
 await f.handler(req,res);
 assert.equal(res.statusCode,200);assert.equal(f.providerCalls,1);
 const denied=fixture(),blocked=new Response();
 await denied.handler({...req,headers:{...req.headers,origin:'https://foreign.example','sec-fetch-site':'cross-site'}},blocked);
 assert.equal(blocked.statusCode,403);assert.equal(blocked.body.code,'origin_mismatch');
 assert.equal(denied.providerCalls,0);assert.equal(denied.rpcCalls.length,0);
});
test('unpublishing while a model runs suppresses the whole stale answer',async()=>{
 const f=fixture({changeContent:true}),res=new Response();await f.handler(request(),res);
 assert.equal(res.statusCode,409);assert.equal(res.body.code,'content_changed');assert.equal(res.body.answer,undefined);
});

test('public readiness distinguishes missing trusted backend from an intentionally paused assistant without leaking values',async()=>{
 const res=new Response();
 await createAssistantHandler({env:{OPENAI_API_KEY:'test-secret-must-not-appear'}})({method:'GET',headers:{}},res);
 assert.equal(res.body.reason,'server_configuration');assert.equal(res.body.availability,'unavailable');
 assert.equal(res.body.revision,null);assert.equal(res.body.enabled,false);
 assert(!JSON.stringify(res.body).includes('test-secret'));
 assert.equal(res.body.greeting_audio_url,undefined);assert.equal(res.body.greeting,undefined);
});

test('each configuration gate has a distinct nonsecret readiness reason',()=>{
 for(const [changes,settings,expected] of [
  [{ASSISTANT_ENABLED:'false'},{enabled:true},'server_disabled'],
  [{},{enabled:false},'owner_disabled'],
  [{ASSISTANT_PRICING_VERIFIED:''},{enabled:true},'pricing_unverified'],
  [{OPENAI_API_KEY:''},{enabled:true},'api_key_missing'],
  [{ASSISTANT_SESSION_SECRET:'short'},{enabled:true},'session_secret_invalid'],
  [{ASSISTANT_ENABLED:' true '},{enabled:true},'ready'],
 ]) {const config={...env,...changes};assert.equal(assistantReadiness(config,settings,readConfig(config)),expected);}
});

test('GET readiness checks the browser domain and remains text-only without provider requests',async()=>{
 const db={from(table){const result=table==='assistant_settings'?{data:{enabled:true,suggested_questions:[]}}:{data:null,error:{message:'private diagnostic'}};
  const query={select(){return query;},eq(){return query;},order(){return query;},limit(){return query;},single:async()=>result,maybeSingle:async()=>result,then:(resolve,reject)=>Promise.resolve(result).then(resolve,reject)};return query;}};
 const res=new Response();await createAssistantHandler({env,database:()=>db,revision:async()=>'7'})({method:'GET'},res);
 assert.equal(res.body.enabled,true);assert.equal(res.body.reason,'ready');assert.equal(res.body.revision,'7');
 assert.deepEqual(res.body.faqs,[]);assert.equal(res.body.greeting,undefined);assert.equal(res.body.audio_is_synthetic,undefined);
 assert(!JSON.stringify(res.body).includes('private diagnostic'));
 const handler=createAssistantHandler({env,database:()=>db,revision:async()=>'7'});
 const sameOrigin=new Response();
 await handler({method:'GET',headers:{referer:'https://dawud.pro.et/admin/assistant',host:'dawud.pro.et','sec-fetch-site':'same-origin'}},sameOrigin);
 assert.equal(sameOrigin.body.reason,'ready');assert.equal(sameOrigin.body.enabled,true);
 for(const headers of [
  {referer:'https://dawud.pro.et/admin/assistant',host:'dawud.pro.et'},
  {referer:'https://foreign.example/',host:'dawud.pro.et','sec-fetch-site':'cross-site'},
  {referer:'invalid-url',host:'dawud.pro.et','sec-fetch-site':'same-origin'},
 ]) {
  const blocked=new Response();await handler({method:'GET',headers},blocked);
  assert.equal(blocked.body.reason,'origin_mismatch');assert.equal(blocked.body.enabled,false);
  assert.equal(blocked.body.availability,'unavailable');
 }
});

test('unreadable settings report a settings failure instead of an owner-disabled state',async()=>{
 const db={from:()=>({select(){return this;},eq(){return this;},single:async()=>({data:null,error:{message:'private database detail'}})})};
 const res=new Response();await createAssistantHandler({env,database:()=>db})({method:'GET'},res);
 assert.equal(res.body.reason,'settings_configuration');assert.equal(res.body.availability,'unavailable');
 assert(!JSON.stringify(res.body).includes('private database'));
});
