import {createServer} from 'node:http';
import assistant from '../api/assistant.js';
import contact from '../api/contact.js';

// Loopback-only adapter for Vite's /api proxy. No provider/database secrets are printed.
// Node 22+: node --env-file=.env.local scripts/dev-server.mjs (omit flag for no-key mode).
const routes=new Map([['/api/assistant',assistant],['/api/contact',contact]]);
const server=createServer(async(req,res)=>{
 res.status=status=>{res.statusCode=status;return res;};
 res.json=data=>{if(!res.destroyed){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(data));}return res;};
 const handler=routes.get(new URL(req.url,'http://localhost:3001').pathname);
 if(!handler){res.statusCode=404;res.json({message:'Endpoint not found.'});return;}
 try {
  if(!['GET','POST'].includes(req.method)){res.statusCode=405;res.json({message:'Method not allowed.'});return;}
  let size=0;const chunks=[];
  for await(const chunk of req){
   size+=chunk.length;
   if(size>20000){res.statusCode=413;res.json({code:'invalid_request',message:'The request is too large.'});return;}
   chunks.push(chunk);
  }
  req.body=Buffer.concat(chunks).toString('utf8') || '{}';
  await handler(req,res);
 } catch {
  if(!res.headersSent){res.statusCode=503;res.json({code:'provider_error',message:'The local service is temporarily unavailable.'});}
  else if(!res.destroyed)res.end();
 }
});
server.requestTimeout=30000;
server.headersTimeout=10000;
server.on('error',error=>{console.error(`Local API could not start (${error.code || 'server error'}).`);process.exitCode=1;});
server.listen(3001,'127.0.0.1',()=>console.log('Local API: http://127.0.0.1:3001 (Vite proxies /api)'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
