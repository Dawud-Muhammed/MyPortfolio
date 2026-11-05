import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
try {
 for(const [name,url] of [['live-baseline','https://dawud-muhammed.vercel.app/'],['local-production-no-cms','http://127.0.0.1:4173/']]){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const page=await context.newPage();
  // Production verification is read-only, including blocking automatic page-view writes.
  await page.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
  await page.addInitScript(()=>{window.__studioMetrics={lcp:0,cls:0};new PerformanceObserver(list=>{for(const item of list.getEntries())window.__studioMetrics.lcp=item.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const item of list.getEntries())if(!item.hadRecentInput)window.__studioMetrics.cls+=item.value;}).observe({type:'layout-shift',buffered:true});});
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(8000);results.push({name,url,...await page.evaluate(()=>({...window.__studioMetrics,title:document.title,heading:document.querySelector('h1')?.textContent,jsTransferred:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script').reduce((n,r)=>n+r.transferSize,0)}))});}catch(error){results.push({name,url,error:error.message});}
  await context.close();
 }
 await mkdir('artifacts',{recursive:true});await writeFile('artifacts/performance.json',JSON.stringify({measuredAt:new Date().toISOString(),browser:browser.version(),conditions:'One cold navigation each, Edge headless, 390x844 DPR1, 4x CPU, 150ms latency, 1.6Mbps download; non-GET requests blocked. Local production build lacks CMS credentials; no field/INP claim.',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
