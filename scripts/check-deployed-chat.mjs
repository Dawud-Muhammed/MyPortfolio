// Public, read-only diagnosis. Never accepts, prints or saves a server/API secret.
const origin=new URL(process.argv[2] || 'https://dawud.pro.et').origin;
const get=async url=>{for(let i=0;i<2;i++){try{return await fetch(url,{signal:AbortSignal.timeout(15000)});}catch(error){if(i)throw error;await new Promise(resolve=>setTimeout(resolve,1000));}}};
try {
 const page=await get(origin);const html=await page.text();
 const assets=[...html.matchAll(/(?:src|href)=["']([^"']+\.js)["']/g)].map(match=>new URL(match[1],origin)).filter(url=>url.origin===origin);
 let source='';for(const url of assets)source+='\n'+await (await get(url)).text();
 const endpoint=source.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
 const key=(source.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]).find(value=>{try{return JSON.parse(Buffer.from(value.split('.')[1],'base64url')).role==='anon';}catch{return false;}}) || source.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
 const report={pageStatus:page.status,publicConfigFound:!!(endpoint&&key)};
 const api=await get(`${origin}/api/assistant`);const config=await api.json();
 report.chat={status:api.status,enabled:config.enabled,reason:config.reason||'legacy_endpoint',revisionAvailable:config.revision!=null};
 if(endpoint&&key) for(const [table,select] of [['assistant_settings','enabled'],['content_revision','revision']]) {
  const url=new URL(`${endpoint}/rest/v1/${table}`);url.searchParams.set('select',select);url.searchParams.set('limit','1');
  const response=await fetch(url,{headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)});
  const data=await response.json();report[table]={status:response.status,recordPresent:Array.isArray(data)&&data.length>0};
  if(table==='assistant_settings'&&Array.isArray(data))report[table].ownerEnabled=data[0]?.enabled===true;
 }
 console.log(JSON.stringify(report,null,2));
} catch(error) { console.log(JSON.stringify({error:error.name,networkCode:error.cause?.code}));process.exitCode=1; }
