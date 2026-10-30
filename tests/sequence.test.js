import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { frameAt, textAt, coverRect, sourceCrop } from '../sequence-math.js';
import { rooms, galleryImages } from '../src/content.js';
test('forward and reverse scrolling map to the same exact frame',()=>{const positions=[0,.01,.2,.5,.8,.94,1];const forward=positions.map(p=>frameAt(p,220));assert.deepEqual(forward,[0,2,47,116,186,219,219]);assert.deepEqual(positions.toReversed().map(p=>frameAt(p,220)),forward.toReversed());assert.equal(frameAt(-1,220),0);assert.equal(frameAt(2,220),219);});
test('copy immediately fades and recedes; final frame gets a release hold',()=>{assert.equal(textAt(0).opacity,1);assert.ok(textAt(1).opacity<1);assert.ok(textAt(1).z<0);assert.deepEqual(textAt(150),{opacity:0,z:-320});assert.deepEqual(textAt(800),{opacity:0,z:-320});assert.equal(frameAt(.96,220),frameAt(1,220));});
test('cover framing fills portrait, landscape and tablet screens without stretching',()=>{for(const [w,h] of [[390,844],[1440,900],[768,1024],[844,390]]){const r=coverRect(1920,1080,w,h,.62);assert.ok(r.w>=w-.01&&r.h>=h-.01);assert.ok(r.x<=0&&r.y<=0);assert.ok(r.x+r.w>=w-.01&&r.y+r.h>=h-.01);assert.ok(Math.abs(r.w/r.h-1920/1080)<.001);}});
test('mobile sequence frames stay geometrically centred in the portrait viewport',()=>{const viewportWidth=390;const r=coverRect(1296*.96,728*.96,viewportWidth,844,.5);assert.ok(Math.abs((r.x+r.w/2)-viewportWidth/2)<.001);});
test('sequence starts static, progressively loads and automatically plays after engagement',async()=>{const [script,css]=await Promise.all([readFile(new URL('../main.js',import.meta.url),'utf8'),readFile(new URL('../style.css',import.meta.url),'utf8')]);assert.match(script,/CRITICAL_COUNT=30/);assert.match(script,/requestIdleCallback/);assert.match(script,/current\+=delta\*/);assert.match(script,/function autoplayTick/);assert.match(script,/requestAnimationFrame\(autoplayTick\)/);assert.match(script,/USER_IDLE_DELAY=700/);assert.match(script,/touchmove[^\n]+passive:true/);assert.match(script,/is-sequence-engaged/);assert.match(css,/\.sequence\{height:var\(--viewport-height,100svh\)/);assert.match(css,/\.sequence\.is-sequence-engaged\{height:calc/);});
test('all 220 original-quality ordered frames, the restored opening image and local content images exist',async()=>{const files=await readdir(new URL('../public/hero-frames/',import.meta.url));assert.equal(files.filter(f=>f.endsWith('.webp')).length,220);for(let i=1;i<=220;i++)await access(new URL(`../public/hero-frames/ezgif-frame-${String(i).padStart(3,'0')}.webp`,import.meta.url));await access(new URL('../public/hero-opening.png',import.meta.url));for(const f of ['lounge.webp','reception.jpg','bathroom.jpg','exterior.webp'])await access(new URL('../public/images/'+f,import.meta.url));const html=await readFile(new URL('../index.html',import.meta.url),'utf8');assert.ok(html.includes('Some stays<br>stay with<br><em>you.</em>'));assert.ok(html.includes('/hero-opening.png'));assert.ok(html.includes('Website powered by Eleos Hub'));});

test('room catalogue preserves the approved order, details and local photography',async()=>{
  assert.deepEqual(rooms.map(({name})=>name),['Standard Deluxe','Royal Deluxe','Executive Suite','Executive Deluxe','Royal Superior','Studio Room','Diplomatic Suite','Presidential Suite']);
  assert.deepEqual(rooms.map(({rate})=>rate),[50000,60000,70000,100000,120000,150000,200000,500000]);
  assert.deepEqual(rooms.map(({size})=>size),['13.5m²','19.6m²','22.5m²','20m²','22.9m²','20m²','40m²','65.5m²']);
  assert.deepEqual(rooms.map(({property})=>property),['annex','annex','annex','main','main','main','main','main']);
  for(const room of rooms) await access(new URL(`../public${room.image}`,import.meta.url));
});

test('the full supplied gallery is local, complete and uniquely described',async()=>{
  assert.equal(galleryImages.length,34);
  assert.equal(new Set(galleryImages.map(({src})=>src)).size,34);
  assert.equal(new Set(galleryImages.map(({alt})=>alt)).size,34);
  for(const image of galleryImages) await access(new URL(`../public${image.src}`,import.meta.url));
});

test("presentation crop symmetrically excludes the rounded export border",()=>{for(const [w,h] of [[1920,1080],[1440,810],[960,540]]){const r=sourceCrop(w,h);assert.ok(Math.abs(r.x/w-.02)<.0001);assert.ok(r.x+r.w<=w);assert.ok(r.y>0&&r.y+r.h<h);}});

