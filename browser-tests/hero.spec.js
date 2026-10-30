import {test,expect} from '@playwright/test';
test.setTimeout(60000);
async function waitForLoader(page){await expect(page.locator('.preloader')).toHaveCount(0,{timeout:10000});}
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
test(`tour auto-plays, yields to scrubbing and releases at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await waitForLoader(page);await expect(page.locator('#sequence-canvas')).toHaveAttribute('data-frame','1');
 await expect(page.locator('.sequence')).not.toHaveClass(/is-sequence-engaged/);
 expect(await page.locator('.sequence').evaluate(e=>Math.abs(e.getBoundingClientRect().height-innerHeight))).toBeLessThan(2);
 expect(await page.evaluate(()=>window.hotelTour.state.engaged)).toBeFalsy();
 expect(await page.evaluate(()=>window.hotelTour.state.autoplay)).toBeFalsy();
 await expect(page.locator('#tour-finale')).toBeHidden();
 if(viewport.width===390)await expect(page.locator('.sequence-poster img')).toHaveCSS('object-position','73% 50%');
 await expect(page.getByRole('link',{name:'Book your stay',exact:true})).toHaveAttribute('href','/booking/');
 await expect(page.getByRole('link',{name:'Scroll to discover',exact:true})).toHaveAttribute('href','#welcome');
 await page.screenshot({path:`test-results/new-hero-${viewport.width}-start.png`});

 // One downward gesture engages the pin and starts the full sequence. No more
 // wheel input is required for the frame and scroll positions to advance.
 await page.mouse.wheel(0,80);
 await expect(page.locator('.sequence')).toHaveClass(/is-sequence-engaged/);
 expect(await page.locator('.sequence').evaluate(e=>e.getBoundingClientRect().height)).toBeGreaterThan(viewport.height*4);
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.autoplay)).toBeTruthy();
 const initialTarget=await page.evaluate(()=>window.hotelTour.state.target);
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.target),{timeout:3000}).toBeGreaterThan(initialTarget+10);
 await expect.poll(()=>page.locator('#hero-copy').evaluate(e=>+getComputedStyle(e).opacity)).toBeLessThan(1);
 await expect.poll(()=>page.evaluate(()=>Math.abs(+document.querySelector('#sequence-canvas').dataset.frame-window.hotelTour.state.target)),{timeout:10000}).toBeLessThanOrEqual(3);
 await page.screenshot({path:`test-results/new-hero-${viewport.width}-middle.png`});

 // Real user input pauses auto-play, scrubs backwards and resumes after idle.
 const beforeScrub=await page.evaluate(()=>window.hotelTour.state.target);
 await page.mouse.wheel(0,-360);
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.autoplay)).toBeFalsy();
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.target)).toBeLessThan(beforeScrub);
 const scrubbedTarget=await page.evaluate(()=>window.hotelTour.state.target);
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.autoplay),{timeout:2500}).toBeTruthy();
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.target),{timeout:3000}).toBeGreaterThan(scrubbedTarget);

 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.target),{timeout:12000}).toBe(220);
 await expect.poll(()=>page.evaluate(()=>window.hotelTour.state.autoplay)).toBeFalsy();
 await expect(page.locator('#sequence-canvas')).toHaveAttribute('data-frame','220');
 await expect(page.locator('#tour-finale')).toHaveClass(/is-visible/);
 await expect(page.getByRole('link',{name:/here/})).toHaveAttribute('href','/booking/');
 await page.getByRole('link',{name:/here/}).focus();
 await expect(page.getByRole('link',{name:/here/})).toBeFocused();
 if(viewport.width===1440)await expect(page.locator('#sequence-frame')).toHaveText('220');
 await page.screenshot({path:`test-results/new-hero-${viewport.width}-end.png`});
 expect(await page.locator('.sequence-stage').evaluate(e=>Math.abs(e.getBoundingClientRect().top))).toBeLessThan(2);

 await page.locator('.skip-tour').click();await expect(page.locator('#welcome')).toBeFocused();
 await expect.poll(()=>page.locator('.sequence-stage').evaluate(e=>e.getBoundingClientRect().top)).toBeLessThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 expect(await page.evaluate(()=>window.hotelTour.state.downloaded)).toBeGreaterThanOrEqual(30);
 expect(await page.evaluate(()=>window.hotelTour.state.downloaded)).toBeLessThanOrEqual(220);
 expect(errors).toEqual([]);
});}
test('reduced motion avoids pinning and respects dark theme',async({page})=>{await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});await page.goto('/');await waitForLoader(page);await expect(page.locator('#sequence-canvas')).toHaveAttribute('data-frame','1');expect(await page.locator('.sequence-stage').evaluate(e=>getComputedStyle(e).position)).toBe('relative');expect(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(19, 36, 45)');expect(await page.evaluate(()=>window.hotelTour.state.downloaded)).toBe(30);await page.screenshot({path:'test-results/dark-reduced-motion.png'});});
test('logo-only loader remains centered and replays on reload',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/');await page.waitForTimeout(650);await expect(page.locator('.preloader__logo')).toBeVisible();await expect(page.locator('.preloader__name,.preloader__loading,.preloader__percent')).toHaveCount(0);await waitForLoader(page);await page.reload();await page.waitForTimeout(650);await expect(page.locator('.preloader__logo')).toBeVisible();const logo=await page.locator('.preloader__logo-frame').boundingBox();expect(Math.abs((logo.x+logo.width/2)-195)).toBeLessThan(2);expect(Math.abs((logo.y+logo.height/2)-422)).toBeLessThan(2);await expect(page.locator('.preloader__name,.preloader__loading,.preloader__percent')).toHaveCount(0);});
test('a missing frame leaves the restored poster and a usable page',async({page})=>{await page.route('**/hero-frames/ezgif-frame-001.webp',route=>route.abort());await page.goto('/');await waitForLoader(page);await expect(page.locator('#sequence-status')).toContainText('The tour could not load');await expect(page.locator('.sequence-poster img')).toHaveAttribute('src','/hero-opening.png');await page.getByRole('link',{name:'Explore rooms',exact:true}).click();await expect(page).toHaveURL(/\/rooms\/?$/);await expect(page.locator('#main')).toBeVisible();});

for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
test(`new homepage photography remains complete at ${viewport.width}px`,async({page})=>{
 await page.setViewportSize(viewport);
 await page.goto('/');
 await waitForLoader(page);
 await expect(page.getByRole('link',{name:/Blaze & Jacob/}).first()).toHaveAttribute('href','/blaze-and-jacob/');
 await page.getByRole('link',{name:'Scroll to discover',exact:true}).click();
 await expect(page.locator('.sequence')).not.toHaveClass(/is-sequence-engaged/);
 const images=page.locator('.venue-preview img,.gallery-preview img');
 await expect(images).toHaveCount(6);
 for(let index=0;index<await images.count();index++){
  const image=images.nth(index);await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBeTruthy();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:`test-results/home-photography-${viewport.width}.png`,fullPage:true});
});}
