// Screenshot only: overlay the read-only public CMS snapshot inside an isolated browser.
// No keys, database writes, source mutations, or paid requests. Not production seed data.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const snapshot=JSON.parse(await readFile('docs/live-public-snapshot.local.json','utf8')).collections;
const tables=Object.fromEntries(Object.entries(snapshot).map(([table,rows])=>[table,Array.isArray(rows)?rows.map(row=>({...row,is_published:true,publication_status:/^(draft|private)$/i.test(row.status||'')?'draft':'published'})):[]]));
tables.projects=(tables.projects||[]).sort((a,b)=>(a.order_index||0)-(b.order_index||0));
const browser=await chromium.launch({channel:'msedge',headless:true});
const githubChecks=[];
await mkdir('artifacts/screenshots',{recursive:true});
try {
 const context=await browser.newContext();const page=await context.newPage();
 page.on('requestfailed',request=>{if(request.url().startsWith('https://github-contributions-api.jogruber.de/'))console.log('GitHub public request failure:',request.failure()?.errorText);});
 page.on('response',response=>{if(response.url().startsWith('https://github-contributions-api.jogruber.de/'))console.log('GitHub public response:',response.status());});
 await page.route('**/src/lib/supabase.ts*',async route=>{const response=await route.fetch();const source=(await response.text()).replace(/const supabaseUrl = [^\n]+;/,'const supabaseUrl = "https://snapshot.supabase.test";').replace(/const supabaseAnonKey = [^\n]+;/,'const supabaseAnonKey = "read-only-public-snapshot";');await route.fulfill({response,body:source});});
 await page.route('https://snapshot.supabase.test/rest/v1/**',async route=>{const url=new URL(route.request().url());const table=url.pathname.split('/').pop();const rows=(tables[table]||[]).filter(row=>[...url.searchParams].every(([key,value])=>!value.startsWith('eq.')||String(row[key])===value.slice(3)));await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});});
 await page.route('**/api/assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({enabled:false,greeting:'Hey, I’m Dawud Muhammed’s AI portfolio guide. What would you like to know about his projects, experience, or how he could help with your project?',portrait_url:tables.profile?.[0]?.profile_picture_url,greeting_audio_url:'/audio/introduction.wav',audio_is_synthetic:true,faqs:[],suggested_questions:[],revision:'read-only-snapshot'})}));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:1000});await page.goto('http://127.0.0.1:5174/');await page.getByRole('heading',{level:1}).waitFor();
  await page.getByRole('heading',{name:'Car Rental Portal',exact:true}).waitFor({timeout:20000});
  await page.locator('.github-activity .activity-total').waitFor({timeout:25000});
  const graph=page.getByRole('region',{name:'GitHub contribution calendar',exact:true});
  const geometry=await graph.evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth}));
  if(width===1440&&geometry.scrollWidth>geometry.clientWidth+1)throw new Error('Desktop calendar is not fully visible');
  githubChecks.push({width,total:await page.locator('.activity-total').innerText(),years:await page.locator('#contribution-year option').allTextContents(),geometry});
  await page.waitForTimeout(1500);
  for(const theme of ['light','dark']){await page.getByLabel('Color theme').selectOption(theme);await page.waitForTimeout(500);await page.screenshot({path:`artifacts/screenshots/public-snapshot-${theme}-${width}.png`,fullPage:true});}
 }
 await page.getByRole('button',{name:"Dawud's AI Assistant",exact:true}).click();await page.screenshot({path:'artifacts/screenshots/public-snapshot-guide-mobile.png'});
 await page.getByRole('button',{name:'Close guide'}).click();
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5174/projects');
 const card=page.locator('.project-card').first();await card.waitFor();await card.hover();await page.waitForTimeout(400);
 const hover=await card.evaluate(el=>getComputedStyle(el).transform);if(hover==='none')throw new Error('Project hover did not respond');
 await page.screenshot({path:'artifacts/screenshots/public-snapshot-projects-dark-1440.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 if(await card.evaluate(el=>getComputedStyle(el).transform)!=='none')throw new Error('Reduced-motion hover did not settle');
 await page.getByRole('button',{name:"Dawud's AI Assistant",exact:true}).click();
 await page.screenshot({path:'artifacts/screenshots/public-snapshot-guide-desktop.png'});
 const phone=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await phone.goto('http://127.0.0.1:5175/');await phone.locator('.github-activity .activity-total').waitFor({timeout:25000});
 await phone.getByLabel('Color theme').selectOption('dark');
 const touchCell=phone.locator('.contribution-cells button').first();await touchCell.tap();
 const touchSize=await touchCell.boundingBox();if(!touchSize||touchSize.width<23.5||touchSize.height<23.5)throw new Error('Touch cells are too small');
 await phone.getByRole('tooltip').waitFor();await phone.screenshot({path:'artifacts/screenshots/github-touch-390.png'});
 githubChecks.push({width:390,hasTouch:true,cell:touchSize,total:await phone.locator('.activity-total').innerText()});await phone.close();
 console.log('Captured four theme/viewport previews and portrait guide using read-only public CMS snapshot. Live AI disabled.');
 await writeFile('artifacts/github-live-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),source:'https://github-contributions-api.jogruber.de/v4/Dawud-Muhammed?y=all',githubData:'Actual network responses; no GitHub fixtures in this script.',checks:githubChecks},null,2)+'\n');
}catch(error){const page=browser.contexts()[0]?.pages()[0];if(page){console.log('GitHub panel:',await page.locator('.github-activity').innerText());await page.screenshot({path:'artifacts/screenshots/github-live-error.png'});}throw error;}finally{await browser.close();}
