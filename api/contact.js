import { PublicError, validateContact } from '../server/assistant-core.mjs';
import { database, json, failure, parseBody, checkOrigin, identities } from '../server/runtime.mjs';

export function createContactHandler(dependencies = {}) {
 const env=dependencies.env || process.env;
 const getDatabase=dependencies.database || database;
 return async function handler(req,res) {
  if(req.method!=='POST') { res.setHeader('Allow','POST'); return json(res,405,{message:'Method not allowed.'}); }
  try {
    checkOrigin(req,env);
    const message=validateContact(parseBody(req));
    const db=getDatabase(env);
    const identity=identities(req,res,env);
    const {data:allowed,error}=await db.rpc('studio_throttle',{p_key:`contact:${identity.client}`,p_limit:10,p_seconds:3600});
    if(error) throw new PublicError('configuration_error','Messages are temporarily unavailable. Please use a direct contact link.');
    if(!allowed) throw new PublicError('rate_limited','Please wait before sending another message, or use a direct contact link.',429);
    const {error:insertError}=await db.from('contact_messages').insert({...message,is_read:false,is_archived:false,is_spam:false});
    if(insertError) throw new PublicError('configuration_error','Your message was not saved. Please try a direct contact option.');
    return json(res,200,{ok:true,message:'Message received in Dawud’s portfolio inbox.'});
  } catch(error) { return failure(res,error); }
}
}
export default createContactHandler();
