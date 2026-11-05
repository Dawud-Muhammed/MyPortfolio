import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { renderResponse } from '../server/render-page.js';

export default async function page(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) { res.setHeader('Allow', 'GET, HEAD'); return res.status(405).send('Method not allowed.'); }
  const endpoint = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  let db = null;
  try { if (endpoint && anon) db = createClient(endpoint, anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store', signal: AbortSignal.timeout(8000) }) } }); } catch { /* Fail closed with a useful 503 shell. */ }
  let template;
  try { template = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8'); } catch { /* The renderer has a crawlable emergency shell. */ }
  const rawPath = req.query?.path;
  const path = typeof rawPath === 'string' ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : new URL(req.url || '/', 'http://localhost').pathname;
  const result = await renderResponse({ path, db, template, origin: process.env.SITE_URL });
  res.setHeader('Content-Type', result.type);
  if (result.status === 503) res.setHeader('Retry-After', '60');
  return res.status(result.status).send(req.method === 'HEAD' ? '' : result.body);
}
