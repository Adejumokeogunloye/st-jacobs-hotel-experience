import { test, expect } from '@playwright/test';

test('mobile menu exposes every required route and traps no overflow', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/rooms/');
  await expect(page.getByRole('heading',{name:/Room to/})).toBeVisible();
  await page.getByRole('button',{name:'Open menu'}).click();
  for(const label of ['Home','Our Rooms','Blaze & Jacob','St. Jacobs Annex','Facilities','About Us','Gallery','Contact Us','Book a Room']) await expect(page.locator('.menu-panel').getByRole('link',{name:label,exact:true})).toBeVisible();
  await expect(page.locator('.menu-panel').getByRole('link',{name:'Blog',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Close menu'})).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Open menu'})).toHaveAttribute('aria-expanded','false');
  await expect(page.getByText('© 2026 St. Jacobs Hotel. All rights reserved.')).toBeVisible();
  await expect(page.getByText('Website powered by Eleos Hub')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/mobile-rooms-thirds.png',fullPage:true});
});

test('all principal routes render without page errors', async ({page}) => {
  for(const route of ['/rooms/','/rooms/diplomatic-suite/','/annex/','/facilities/','/blaze-and-jacob/','/about/','/gallery/','/contact/','/booking/','/blog/','/manage-booking/']){
    const errors=[]; page.removeAllListeners('pageerror'); page.on('pageerror',e=>errors.push(e.message));
    await page.goto(route);
    await expect(page.locator('#main')).toBeVisible();
    expect(errors,route).toEqual([]);
  }
});

test('Blaze and Jacob has a complete image-led page',async({page})=>{
  await page.goto('/blaze-and-jacob/');
  await expect(page.getByRole('heading',{name:/Blaze/})).toBeVisible();
  await expect(page.locator('.venue-collage img')).toHaveCount(3);
  await expect(page.getByRole('link',{name:'Plan an evening'})).toHaveAttribute('href',/Blaze%20and%20Jacob%20enquiry/);
  const images=page.locator('.venue-hero img,.venue-collage img,.venue-final img');
  for(let index=0;index<await images.count();index++){
    const image=images.nth(index);await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBeTruthy();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/blaze-and-jacob-desktop.png',fullPage:true});
});

test('gallery includes all 34 supplied images and filters accessibly',async({page})=>{
  await page.goto('/gallery/');
  const items=page.locator('.gallery-item');
  await expect(items).toHaveCount(34);
  for(let index=0;index<34;index++){
    const image=items.nth(index).locator('img');await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBeTruthy();
  }
  await page.getByRole('button',{name:'Blaze & Jacob',exact:true}).click();
  const visibleItems=page.locator('.gallery-item:visible');
  await expect(visibleItems).toHaveCount(10);
  const first=visibleItems.first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  await expect(page.locator('.lightbox')).toBeVisible();
  await expect(page.locator('.lightbox figcaption')).toContainText('1 / 10');
  await page.getByRole('button',{name:'Next image'}).click();
  await expect(page.locator('.lightbox figcaption')).toContainText('2 / 10');
  await page.getByRole('button',{name:'Close image viewer'}).click();
});

test('new photography pages remain composed on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/blaze-and-jacob/','/gallery/']){
    await page.goto(route);
    await expect(page.locator('#main')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBeTruthy();
  }
  await page.screenshot({path:'test-results/gallery-mobile.png',fullPage:true});
});

test('room catalogue renders the approved order, rates and photographs', async ({page}) => {
  await page.goto('/rooms/');
  const cards=page.locator('.cards .card');
  await expect(cards).toHaveCount(8);
  await expect(cards.locator('h2')).toHaveText(['Standard Deluxe','Royal Deluxe','Executive Suite','Executive Deluxe','Royal Superior','Studio Room','Diplomatic Suite','Presidential Suite']);
  await expect(cards.locator('.price')).toHaveText([/₦50,000/,/₦60,000/,/₦70,000/,/₦100,000/,/₦120,000/,/₦150,000/,/₦200,000/,/₦500,000/]);
  for(let index=0;index<8;index++){
    const image=cards.nth(index).locator('img');
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0)).toBeTruthy();
  }
});

test('real booking request is stored, retrieved and cancellable through Supabase', async ({page}) => {
  await page.addInitScript(()=>{window.__SUPABASE_CONFIG__={url:'https://hotel.supabase.co',anonKey:'public-key'}});
  let status='pending_confirmation';
  let submittedPhone='';
  await page.route('https://hotel.supabase.co/rest/v1/rpc/**',async route=>{
    const name=new URL(route.request().url()).pathname.split('/').pop();
    if(name==='create_booking_request'){submittedPhone=route.request().postDataJSON().p_guest_phone;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reference:'SJH-20261029-ABC12345',access_token:'private-access-code',status,room_slug:'executive-deluxe',room_name:'Executive Deluxe',check_in:'2027-01-10',check_out:'2027-01-12',nights:2,nightly_rate:100000,total_amount:200000})})}
    if(name==='get_booking')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reference:'SJH-20261029-ABC12345',status,room_slug:'executive-deluxe',room_name:'Executive Deluxe',guest_name:'Test Guest',check_in:'2027-01-10',check_out:'2027-01-12',nights:2,adults:2,children:0,nightly_rate:100000,total_amount:200000})});
    if(name==='cancel_booking_request'){status='cancelled';return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reference:'SJH-20261029-ABC12345',status})})}
  });
  await page.goto('/booking/?room=executive-deluxe');
  await page.locator('#checkIn').fill('2027-01-10');
  await page.locator('#checkOut').fill('2027-01-12');
  await page.locator('#guestName').fill('Test Guest');
  await page.locator('#guestEmail').fill('guest@example.com');
  await page.locator('#guestPhone').fill('0803 123 4567');
  await page.locator('[name="consent"]').check();
  await page.getByRole('button',{name:/Request this room/}).click();
  await expect(page.getByText('REQUEST RECEIVED',{exact:true})).toBeVisible();
  expect(submittedPhone).toBe('+2348031234567');
  await expect(page.getByText('Pending hotel confirmation')).toBeVisible();
  const href=await page.getByRole('link',{name:'View booking status'}).getAttribute('href');
  await page.goto(href);
  await expect(page.getByText('Pending hotel confirmation')).toBeVisible();
  page.on('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Cancel request'}).click();
  await expect(page.getByText('Cancelled')).toBeVisible();
});

test('booking cannot collect guest data before Supabase is configured', async ({page}) => {
  await page.addInitScript(()=>{window.__SUPABASE_CONFIG__={url:'',anonKey:''}});
  await page.goto('/booking/');
  await expect(page.getByRole('button',{name:/Request this room/})).toBeDisabled();
  await expect(page.getByText(/Online booking is being connected/)).toBeVisible();
});
