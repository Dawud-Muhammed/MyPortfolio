import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5175/');
 await page.getByRole('heading',{name:'Car Rental Portal',exact:true}).waitFor();
 assert.equal(await page.locator('.preview-notice').count(),1);
 const readOnly=await page.request.post('http://127.0.0.1:5175/api/contact',{data:{name:'Local verification'}});
 assert.equal(readOnly.status(),405);
 const config=await page.request.get('http://127.0.0.1:5175/api/assistant');
 assert.equal((await config.json()).enabled,false);
 const audio=await page.request.get('http://127.0.0.1:5175/audio/introduction.wav');assert.equal(audio.status(),200);
 await page.goto('http://127.0.0.1:5175/not-a-page');await page.getByRole('heading',{level:1}).waitFor();
 await page.waitForFunction(()=>document.querySelector('meta[name=robots]')?.getAttribute('content')==='noindex,nofollow');
 await page.locator('.desktop-nav').getByRole('link',{name:'About',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('meta[name=robots]')?.getAttribute('content')==='index,follow');
 const structured=await page.locator('script[type="application/ld+json"]').textContent();assert.ok(JSON.parse(structured).url.endsWith('/about'));
 console.log('Passed: real public snapshot rendering, local write denial, free disabled guide/audio, and 404-to-public metadata refresh.');
}finally{await browser.close();}
