const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.IPR_PLAYWRIGHT || 'playwright');
const base=process.env.IPR_TEST_BASE||'http://127.0.0.1:8783';
const routes={about:'/',data:'/topics/',reports:'/reports/',story:'/about/',...Object.fromEntries(['commitment','investment','tools','ai','mining','maturity'].map(x=>[x,`/topics/${x}/`])),...Object.fromEntries([1400,1401,1402,1403,1404].map(y=>[`report-${y}`,`/reports/${y}/`]))};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.IPR_BROWSER?{executablePath:process.env.IPR_BROWSER}:{channel:'chrome'})});
 const page=await browser.newPage({viewport:{width:1365,height:900}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Stub backend status during local static previews; it is covered separately on production.
 await page.route('**/api/assistant/status',route=>route.fulfill({contentType:'application/json',body:'{"enabled":true}'}));
 const records=[];
 for(const lang of ['fa','en'])for(const [id,path] of Object.entries(routes)){
  const response=await page.goto(base+path+'?lang='+lang);assert.equal(response.status(),200,path);
  await page.waitForSelector('#view > .page');
  assert.equal(await page.locator('#view > .page').count(),1,path);
  assert.equal(await page.locator('#view > .page').getAttribute('id'),id,path);
  assert.equal(await page.locator('#loader').count(),0);
  const chapters=await page.locator('.question-card').count();
  if(path.startsWith('/topics/')&&id!=='data')assert(chapters>0);else assert.equal(chapters,0);
  if(id==='about'){assert.equal(await page.locator('[data-event-gallery]').count(),0);assert.equal(await page.locator('script[src*="annual-indicators"]').count(),0)}
  records.push({id,lang,questions:chapters,nodes:await page.locator('*').count()});
 }
 await page.goto(base+'/topics/commitment/?lang=en');await page.waitForSelector('#commitment');
 await page.reload();await page.waitForSelector('#commitment');assert.equal(new URL(page.url()).pathname,'/topics/commitment/');
 let documents=0;page.on('request',r=>{if(r.resourceType()==='document')documents++});
 await page.locator('.pg-next[data-nav="investment"]').click();await page.waitForURL('**/topics/investment/?lang=en');await page.waitForSelector('#investment');assert(documents>0,'navigation must load a new document');
 await page.goBack();await page.waitForSelector('#commitment');
 await page.locator('[data-lang-switch]').click();await page.waitForURL('**/topics/commitment/?lang=fa');await page.waitForSelector('#commitment');
 for(const [old,path,id,hash] of [['#maturity','/topics/maturity/','maturity',''],['#report-1403','/reports/1403/','report-1403',''],['#story-method','/about/','story','#story-method'],['#q-q-1','/topics/commitment/','commitment','#q-q-1'],['#annual-1403-event','/reports/1403/','report-1403','#annual-1403-event']]){
  await page.goto(base+'/?lang=en'+old);await page.waitForSelector('#'+id);assert.equal(new URL(page.url()).pathname,path);assert.equal(new URL(page.url()).hash,hash);
 }
 await page.goto(base+'/reports/1403/?lang=en');await page.waitForSelector('[data-event-gallery]');
 assert.equal(await page.locator('[data-event-photo]').count(),66);
 await page.locator('[data-event-photo]').last().click();assert((await page.locator('.event-photo-stage img').getAttribute('src')).endsWith('1403-cam2-63.webp'));
 await page.locator('.event-photo-expand').click();await page.waitForSelector('.event-photo-dialog[open]');await page.locator('.photo-dialog-close').click();
 await page.locator('[data-open-form]').first().click();assert.equal(await page.locator('#form-modal').isVisible(),true);await page.locator('[data-close-form]').last().click();
 await page.setViewportSize({width:390,height:844});
 for(const path of ['/','/topics/commitment/','/reports/1404/']){
  await page.goto(base+path);await page.waitForSelector('#view > .page');
  await page.locator('.menu-button').click();await page.locator('[data-menu="reports"] .nav-trigger').click();
  const link=page.locator('#nav-reports [data-nav="report-1403"]');assert((await link.getAttribute('href')).includes('/reports/1403/'));
  await link.click();await page.waitForURL('**/reports/1403/');await page.waitForSelector('#report-1403');assert.equal(await page.locator('#section-nav').evaluate(el=>el.classList.contains('open')),false);
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({PASS:true,documents:30,behaviors:['direct URLs','reload','new document navigation','back','language','legacy links','66 photo gallery','downloads dialog','mobile menu'],records},null,2));

 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
