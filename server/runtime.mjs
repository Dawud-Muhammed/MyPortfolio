import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { PublicError, LIMITS } from './assistant-core.mjs';

export function database(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new PublicError('configuration_error', 'This service is not configured yet. Please use the direct contact links.');
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(8000) }) } });
}
export function json(res, status, data) {
  if(res.destroyed) return;
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(status).json(data);
}
export function failure(res, error) {
  const known = error instanceof PublicError;
  return json(res, known ? error.status : 503, { code: known ? error.code : 'provider_error',
    message: known ? error.message : 'This service is temporarily unavailable. Please use the contact page.' });
}
export function parseBody(req) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new PublicError('invalid_request','Send JSON content.',415);
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (Buffer.byteLength(body)>LIMITS.body) throw new PublicError('invalid_request','The request is too large.',413);
  try { return JSON.parse(body); } catch { throw new PublicError('invalid_request','Invalid request.',400); }
}
export function checkOrigin(req, env = process.env) {
  const origin = req.headers.origin;
  const allowed = new Set([env.SITE_URL, env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null].filter(Boolean));
  if (env.NODE_ENV !== 'production') {
    for(const host of ['localhost','127.0.0.1']) for(const port of [5173,3000,3001,4173]) allowed.add(`http://${host}:${port}`);
  }
  if (!origin || !allowed.has(origin)) throw new PublicError('invalid_request','This request must come from the portfolio.',403);
}
export function identities(req, res, env = process.env) {
  const secret = env.ASSISTANT_SESSION_SECRET;
  if (!secret || secret.length<32) throw new PublicError('configuration_error','This service is not configured yet. Please use the contact page.');
  const sign = text => createHmac('sha256',secret).update(text).digest('hex');
  let cookie = String(req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('studio_session='))?.slice(15);
  const parts = cookie?.split('.') || [];
  const payload = parts.slice(0,2).join('.');
  const valid = parts.length===3 && /^[a-f0-9-]{36}$/.test(parts[0]) && Number(parts[1])>Date.now()
    && /^[a-f0-9]{64}$/.test(parts[2]) && timingSafeEqual(Buffer.from(sign(payload)),Buffer.from(parts[2]));
  if (!valid) {
    const payload = `${randomUUID()}.${Date.now()+86400000}`;
    cookie = `${payload}.${sign(payload)}`;
    res.setHeader('Set-Cookie',`studio_session=${cookie}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=86400${env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  }
  // Only Vercel's overwritten proxy header is trusted in production; don't accept arbitrary forwarded-for.
  const client = env.VERCEL ? String(req.headers['x-vercel-forwarded-for'] || 'unknown').split(',')[0] : req.socket?.remoteAddress || 'local';
  return { session: sign(`session:${cookie.split('.')[0]}`), client: sign(`client:${client}`) };
}
export async function revision(db) {
  const { data, error } = await db.from('content_revision').select('revision').eq('id',true).single();
  if (error || !data) throw new PublicError('configuration_error','The guide is temporarily unavailable. Please use the contact page.');
  return String(data.revision);
}
export async function loadKnowledge(db) {
  const fields = {
    profile:'id,name,title,bio,location,tagline,email,phone,is_published,assistant_eligible',
    projects:'id,title,slug,excerpt,description,role,team_contribution,problem,intended_users,decisions,implementation,challenges,evidence,outcomes,status,publication_status,assistant_eligible',
    services:'id,title,description,is_published,assistant_eligible',
    experience:'id,role,company,description,start_date,end_date,is_published,assistant_eligible',
    faqs:'id,question,answer,is_published,assistant_eligible',
  };
  const entries = await Promise.all(Object.entries(fields).map(async ([table,select]) => {
    let query=db.from(table).select(select).eq('assistant_eligible',true);
    query=table==='projects'?query.eq('publication_status','published'):query.eq('is_published',true);
    const {data,error}=await query.order(table==='profile'?'id':'order_index',{ascending:true}).limit(30);
    if(error) throw new PublicError('configuration_error','The published knowledge could not be loaded. Please use the contact page.');
    return [table,data];
  }));
  return Object.fromEntries(entries);
}
