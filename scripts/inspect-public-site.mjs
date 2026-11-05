// Read-only verification of the deployed public site; never uses private credentials.
// The public anon key is held in memory and is never logged or saved.
import {writeFile} from 'node:fs/promises';
const origin='https://dawud-muhammed.vercel.app';
const get=async url=>{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Public response ${response.status}`);return response.text();};
try {
 const html=await get(origin);
 const assetPaths=[...html.matchAll(/(?:src|href)=["']([^"']+\.js)["']/g)].map(match=>new URL(match[1],origin)).filter(url=>url.origin===origin);
 let source='';for(const address of assetPaths)source+='\n'+await get(address);
 const endpoint=source.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
 const candidates=source.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[];
 const key=candidates.find(value=>{try{return JSON.parse(Buffer.from(value.split('.')[1],'base64url')).role==='anon';}catch{return false;}});
 if(!endpoint||!key){console.log(JSON.stringify({siteReadable:true,publicConfigurationFound:false,scripts:assetPaths.length}));process.exit(0);}
 const fields={profile:'name,title,tagline,bio,location,profile_picture_url,resume_url',hero_content:'*',projects:'id,title,slug,excerpt,description,status,is_featured,cover_image_url,demo_url,github_url,video_demo_url,order_index,technologies:project_technologies(technology:technologies(id,name))',navigation_items:'id,label,target,is_visible,order_index,location',seo_settings:'site_title_template,meta_description,og_image_url',website_settings:'site_name,logo_url,footer_tagline,whatsapp_enabled,whatsapp_number',education:'institution,degree,field,start_date,end_date',experience:'company,role,start_date,end_date,is_current',gallery_items:'image_url,caption',blog_posts:'title,slug,content,published_at,reading_time,status'};
 const snapshot={checkedAt:new Date().toISOString(),origin,collections:{}};
 for(const [table,select] of Object.entries(fields)){
  const address=new URL(`${endpoint}/rest/v1/${table}`);address.searchParams.set('select',select);address.searchParams.set('limit','100');
  if(table==='blog_posts')address.searchParams.set('status','eq.Published');
  const response=await fetch(address,{headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)});
  if(response.ok)snapshot.collections[table]=await response.json();
  else snapshot.collections[table]={error:response.status};
 }
 await writeFile('docs/live-public-snapshot.local.json',JSON.stringify(snapshot,null,2));
 console.log(JSON.stringify({siteReadable:true,publicConfigurationFound:true,counts:Object.fromEntries(Object.entries(snapshot.collections).map(([table,rows])=>[table,Array.isArray(rows)?rows.length:rows.error])),snapshot:'docs/live-public-snapshot.local.json'}));
}catch(error){console.log(JSON.stringify({siteReadable:false,error:error.message}));process.exitCode=1;}
