import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';
import { LIMITS, INSTRUCTIONS, OUTPUT_SCHEMA, PublicError, readConfig, parseQuestion,
  buildKnowledge, makeInput, reservationCost, usageCost, validateAnswer } from '../server/assistant-core.mjs';
import { database, json, failure, parseBody, checkOrigin, canonicalOrigin, identities, revision, loadKnowledge } from '../server/runtime.mjs';

export const config = { maxDuration: 30 };
const FALLBACK = { enabled: false, availability: 'unavailable', portrait_url: null,
  faqs: [], suggested_questions: ['How can I contact Dawud?'], revision: null };
export function assistantReadiness(env,settings,configuration) {
 if(!configuration.enabled) return 'server_disabled';
 if(!settings.enabled) return 'owner_disabled';
 if(!configuration.priceVerified) return 'pricing_unverified';
 if(!env.OPENAI_API_KEY?.trim()) return 'api_key_missing';
 if((env.ASSISTANT_SESSION_SECRET?.length || 0)<32) return 'session_secret_invalid';
 return 'ready';
}
export function createAssistantHandler(dependencies = {}) {
 const env=dependencies.env || process.env;
 const getDatabase=dependencies.database || database;
 const getRevision=dependencies.revision || revision;
 const getKnowledge=dependencies.loadKnowledge || loadKnowledge;
 const Provider=dependencies.OpenAI || OpenAI;
 return async function handler(req, res) {
  if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow','GET, POST'); return json(res,405,{code:'invalid_request',message:'Method not allowed.'}); }
  let db; let reservation; let reconciled = false; let disconnect; let controller; let stage='server_configuration';
  try {
    if(req.method==='POST') checkOrigin(req,env);
    // Same-origin browser GETs omit Origin but include Referer. Exercise the POST domain gate
    // for readiness too, without reserving credit or dispatching a provider request.
    const browserOrigin=req.headers?.origin || (req.headers?.referer ? canonicalOrigin(req.headers.referer) || 'invalid' : null);
    if(req.method==='GET' && browserOrigin) {
      stage='origin_mismatch';
      checkOrigin({...req,headers:{...req.headers,origin:browserOrigin}},env);
    }
    stage='server_configuration';
    db=getDatabase(env);
    stage='settings_configuration';
    const {data:settings,error}=await db.from('assistant_settings').select('enabled,portrait_url,suggested_questions').eq('id',true).single();
    if(error || !settings) throw new PublicError('configuration_error','The guide is not configured yet. Please use the contact page.');
    stage='model_or_limits_configuration';
    const configuration=readConfig(env);
    const reason=assistantReadiness(env,settings,configuration);
    const ready=reason==='ready';
    if(req.method==='GET') {
      stage='content_configuration';
      const [portrait,faqs,currentRevision]=await Promise.all([
        db.from('profile').select('profile_picture_url').eq('is_published',true).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle(),
        db.from('faqs').select('id,question,answer').eq('is_published',true).order('order_index').limit(8),
        getRevision(db),
      ]);
      return json(res,200,{ enabled:ready,availability:ready?'ready':'paused',reason,
        portrait_url: settings.portrait_url || portrait.data?.profile_picture_url || null,
        suggested_questions:settings.suggested_questions || [],faqs:faqs.data || [],revision:currentRevision });
    }
    if(!ready) throw new PublicError('disabled','Live answers are currently paused. Browse the published FAQs or contact Dawud.');
    const question=parseQuestion(parseBody(req));
    const identity=identities(req,res,env);
    const startingRevision=await getRevision(db);
    const sources=buildKnowledge(await getKnowledge(db),question);
    if(startingRevision!==await getRevision(db)) throw new PublicError('content_changed','Portfolio content has just changed. Please try again.',409);
    if(!sources.length) return json(res,200,{answer:'Hi! Dawud’s published portfolio information is not available yet. Please contact him to learn more about his work.',sources:[{id:'contact',title:'Contact Dawud',url:'/contact'}],revision:startingRevision});
    const input=makeInput(question,sources);
    const estimate=reservationCost(input,configuration.pricing);
    if(req.aborted || res.destroyed) return;
    const {data:reserved,error:reservationError}=await db.rpc('reserve_assistant_budget',{
      p_session:identity.session,p_client:identity.client,p_cost:estimate.cost,
      p_daily:configuration.daily,p_monthly:configuration.monthly,p_total:configuration.total,
    });
    if(reservationError || !reserved) throw new PublicError('configuration_error','The guide’s usage controls are unavailable. Please use the contact page.');
    if(!reserved.ok) {
      const messages={disabled:'Live answers have been paused.',rate_limited:'Please wait a minute before asking another question.',budget_exhausted:'The guide has reached its usage allowance. Please browse the FAQs or contact Dawud.'};
      throw new PublicError(reserved.code,messages[reserved.code] || 'The guide is temporarily unavailable.',reserved.code==='rate_limited'?429:503);
    }
    reservation=reserved.id;
    if(req.aborted || res.destroyed) {
      // The visitor left before dispatch; this is the only safely known zero-cost cancellation.
      const {error}=await db.rpc('reconcile_assistant_budget',{p_id:reservation,p_actual:0,p_input:0,p_output:0,p_request:null});
      reconciled=!error;
      return;
    }
    controller=new AbortController();
    disconnect=()=>{ if(!res.writableEnded)controller.abort(); };
    res.on('close',disconnect);
    const client=new Provider({apiKey:env.OPENAI_API_KEY.trim(),maxRetries:0,timeout:20000});
    // Deliberately buffered: no model-generated link/text reaches the browser before validation.
    const response=await client.responses.create({model:configuration.model,instructions:INSTRUCTIONS,input,
      store:false,service_tier:'default',max_output_tokens:LIMITS.output,reasoning:{effort:'none'},
      text:{format:{type:'json_schema',name:'portfolio_answer',strict:true,schema:OUTPUT_SCHEMA}},
    },{signal:controller.signal});
    const actual=usageCost(response.usage,configuration.pricing);
    const {error:meterError}=await db.rpc('reconcile_assistant_budget', {p_id:reservation,p_actual:actual,
      p_input:response.usage?.input_tokens ?? null,p_output:response.usage?.output_tokens ?? null,p_request:response.id});
    reconciled=!meterError;
    if(meterError) throw new PublicError('configuration_error','The answer could not be completed safely. Please try again later.');
    if(startingRevision!==await getRevision(db)) throw new PublicError('content_changed','Portfolio content changed while answering. Please ask again for current information.',409);
    if(response.status==='incomplete') throw new PublicError('provider_error','The answer was cut short. Try a shorter question.');
    const answer=validateAnswer(response.output_text,sources);
    return json(res,200,{...answer,requestId:response.id,revision:startingRevision});
  } catch(error) {
    if(req.method==='GET') {
      console.error(JSON.stringify({event:'assistant_configuration_failure',reason:stage}));
      return json(res,200,{...FALLBACK,reason:stage});
    }
    // No raw prompt/conversation, IP, provider body, or secrets enter logs.
    if(!(error instanceof PublicError)) console.error(JSON.stringify({event:'assistant_failure',id:randomUUID(),type:error?.name || 'Error',status:Number.isInteger(error?.status)?error.status:undefined,code:typeof error?.code==='string'&&/^[a-zA-Z0-9_-]{1,60}$/.test(error.code)?error.code:undefined}));
    return failure(res,error);
  } finally {
    if(disconnect) res.removeListener('close',disconnect);
    // Failed/cancelled/unknown calls retain the FULL reservation: never refund uncertain provider work.
    if(reservation && db && !reconciled) await db.rpc('reconcile_assistant_budget',{
      p_id:reservation,p_actual:null,p_input:null,p_output:null,p_request:null,
    }).catch(()=>{});
  }
}
}
export default createAssistantHandler();
