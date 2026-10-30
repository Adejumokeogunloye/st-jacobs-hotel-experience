import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameAt, textAt, coverRect, sourceCrop } from './sequence-math.js';
import { installPreloader } from './preloader.js';
gsap.registerPlugin(ScrollTrigger);

installPreloader();

const section=document.querySelector('.sequence'), stage=document.querySelector('.sequence-stage'), poster=document.querySelector('.sequence-poster'), canvas=document.querySelector('#sequence-canvas'), copy=document.querySelector('#hero-copy'), header=document.querySelector('.header'), shade=document.querySelector('.hero-shade'), status=document.querySelector('#sequence-status'), frameLabel=document.querySelector('#sequence-frame');
const ctx=canvas.getContext('2d',{alpha:false});
const reduce=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width: 767px)');
const COUNT=220, CRITICAL_COUNT=30, CHUNK_SIZE=12;
const AUTO_DURATION=7200, USER_IDLE_DELAY=700;
// One stable Image instance per frame avoids DOM swaps. Only the first 30 are
// requested immediately; the remaining sources are assigned during idle time.
const frames=Array.from({length:COUNT},()=>{const image=new Image();image.decoding='async';return image;});
const loaded=new Set(), loading=new Set(), failed=new Set();
let target=0, current=0, painted=-1, direction=1, lastTarget=0, stopped=false, drawPending=false, width=0,height=0, tourTrigger, renderRaf=0, scrollRaf=0, idleHandle=0, chunkTimer=0, backgroundCursor=CRITICAL_COUNT;
let engaged=false, heroVisible=true, suppressActivation=false, lastObservedScroll=scrollY, touchStartY=null, tourProgress=0;
let autoplayRaf=0, autoplayTimer=0, autoplayStartTime=0, autoplayStartProgress=0, autoplay=false;
let lastWidth=innerWidth;
const source=(i)=>`/hero-frames/ezgif-frame-${String(i+1).padStart(3,'0')}.webp`;
function updateViewport(){document.documentElement.style.setProperty('--viewport-height',`${Math.round(visualViewport?.height||innerHeight)}px`);}
updateViewport();
function size(){const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);painted=-1;paint();}
function nearestLoaded(index){if(loaded.has(index))return index;let nearest=-1,distance=Infinity;for(const candidate of loaded){const delta=Math.abs(candidate-index);if(delta<distance){nearest=candidate;distance=delta;}}return nearest;}
function paint(){drawPending=false;if(stopped)return;const desired=Math.round(current);const index=nearestLoaded(desired);if(index<0||painted===index)return;const image=frames[index];if(!image.naturalWidth)return;const crop=sourceCrop(image.naturalWidth,image.naturalHeight);const r=coverRect(crop.w,crop.h,width,height,.5);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,crop.x,crop.y,crop.w,crop.h,r.x,r.y,r.w,r.h);painted=index;canvas.classList.add('ready');canvas.dataset.frame=String(index+1);if(frameLabel)frameLabel.textContent=String(index+1).padStart(3,'0');}
function queuePaint(){if(!drawPending){drawPending=true;requestAnimationFrame(paint);}}
function loadFrame(index,priority=false){if(stopped||index<0||index>=COUNT||loaded.has(index)||loading.has(index)||failed.has(index))return;const image=frames[index];loading.add(index);image.fetchPriority=priority?'high':'low';image.onload=()=>{loading.delete(index);loaded.add(index);queuePaint();};image.onerror=()=>{loading.delete(index);failed.add(index);if(index===0)status.textContent='The tour could not load. Explore rooms below.';};image.src=source(index);}
function prioritize(index){for(let step=0;step<=14;step++){loadFrame(index+step*direction,step<4);if(step)loadFrame(index-step*direction,step<4);}}
function loadBackgroundChunk(deadline){if(stopped||reduce.matches)return;let assigned=0;while(backgroundCursor<COUNT&&assigned<CHUNK_SIZE&&(!deadline||deadline.didTimeout||deadline.timeRemaining()>3)){loadFrame(backgroundCursor++);assigned++;}if(backgroundCursor<COUNT)scheduleBackgroundFrames();}
function scheduleBackgroundFrames(){if(stopped||reduce.matches||idleHandle||chunkTimer)return;chunkTimer=setTimeout(()=>{chunkTimer=0;if('requestIdleCallback'in window)idleHandle=requestIdleCallback(deadline=>{idleHandle=0;loadBackgroundChunk(deadline);},{timeout:1200});else loadBackgroundChunk();},engaged?450:1100);}
function render(){renderRaf=0;if(stopped)return;const delta=target-current;if(Math.abs(delta)>.01){current+=delta*(mobile.matches?.16:.2);queuePaint();renderRaf=requestAnimationFrame(render);}else{current=target;queuePaint();}}
function requestRender(){if(!renderRaf)renderRaf=requestAnimationFrame(render);}
function setProgress(progress,distance){tourProgress=Math.max(0,Math.min(1,progress));target=frameAt(tourProgress,COUNT);direction=target>=lastTarget?1:-1;lastTarget=target;const text=textAt(distance),posterOpacity=Math.max(0,1-distance/180);copy.style.opacity=text.opacity;copy.style.transform=`translateZ(${text.z}px)`;copy.inert=text.opacity<.05;copy.style.visibility=text.opacity===0?'hidden':'visible';header.style.opacity=text.opacity;header.inert=text.opacity<.05;header.style.visibility=text.opacity===0?'hidden':'visible';shade.style.opacity=Math.max(text.opacity,posterOpacity);poster.style.opacity=posterOpacity;poster.style.visibility=posterOpacity===0?'hidden':'visible';section.dataset.progress=tourProgress.toFixed(3);prioritize(target);requestRender();}
function stopAutoplay(clearResume=true){autoplay=false;section.classList.remove('is-sequence-autoplaying');if(autoplayRaf)cancelAnimationFrame(autoplayRaf);autoplayRaf=0;if(clearResume&&autoplayTimer)clearTimeout(autoplayTimer);if(clearResume)autoplayTimer=0;}
function autoplayTick(now){autoplayRaf=0;if(stopped||!autoplay||reduce.matches)return;const progress=Math.min(1,autoplayStartProgress+(now-autoplayStartTime)/AUTO_DURATION);const distance=Math.max(0,section.offsetHeight-stage.offsetHeight);const top=section.offsetTop+distance*progress;window.scrollTo({top,behavior:'instant'});setProgress(progress,distance*progress);lastObservedScroll=top;if(progress<1)autoplayRaf=requestAnimationFrame(autoplayTick);else stopAutoplay();}
function startAutoplay(){if(stopped||reduce.matches||!engaged||tourProgress>=1)return;stopAutoplay(false);autoplayStartProgress=tourProgress;autoplayStartTime=performance.now();autoplay=true;section.classList.add('is-sequence-autoplaying');autoplayRaf=requestAnimationFrame(autoplayTick);}
function pauseForUser(){if(!engaged)return;stopAutoplay();autoplayTimer=setTimeout(()=>{autoplayTimer=0;startAutoplay();},USER_IDLE_DELAY);}
function resetStaticHero(){stopAutoplay();tourProgress=0;target=0;current=0;lastTarget=0;copy.style.cssText='';header.style.cssText='';poster.style.cssText='';copy.inert=false;header.inert=false;shade.style.opacity=1;section.dataset.progress='0.000';queuePaint();}
function createTourTrigger(){tourTrigger?.kill();tourTrigger=ScrollTrigger.create({trigger:section,start:'top top',end:()=>`+=${section.offsetHeight-stage.offsetHeight}`,invalidateOnRefresh:true,onUpdate:self=>setProgress(self.progress,Math.max(0,self.scroll()-self.start)),onRefresh:self=>setProgress(self.progress,Math.max(0,self.scroll()-self.start))});}
function engageSequence(){if(engaged||stopped||reduce.matches||!heroVisible||suppressActivation)return false;engaged=true;section.classList.add('is-sequence-engaged');createTourTrigger();ScrollTrigger.refresh();prioritize(0);requestRender();requestAnimationFrame(startAutoplay);return true;}
function configure(){tourTrigger?.kill();if(reduce.matches){engaged=false;section.classList.remove('is-sequence-engaged');resetStaticHero();if(!loaded.has(0))canvas.classList.remove('ready');}else if(engaged)createTourTrigger();else resetStaticHero();}
for(let i=0;i<CRITICAL_COUNT;i++)loadFrame(i,true);
setTimeout(scheduleBackgroundFrames,650);
size();configure();
const resizeObserver=new ResizeObserver(()=>{size();});resizeObserver.observe(stage);
const onResize=()=>{if(Math.abs(innerWidth-lastWidth)>1){lastWidth=innerWidth;updateViewport();ScrollTrigger.refresh();}};
window.addEventListener('resize',onResize,{passive:true});
const onMotion=()=>{configure();ScrollTrigger.refresh();};reduce.addEventListener('change',onMotion);
const heroObserver=new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;},{threshold:.05});heroObserver.observe(section);
const onWheel=e=>{if(e.deltaY>0&&!engaged)engageSequence();else if(engaged)pauseForUser();};
const onTouchStart=e=>{touchStartY=e.touches[0]?.clientY??null;};
const onTouchMove=e=>{const y=e.touches[0]?.clientY;if(touchStartY!==null&&y!==undefined&&Math.abs(touchStartY-y)>4){if(touchStartY-y>0&&!engaged)engageSequence();else if(engaged)pauseForUser();}touchStartY=y??touchStartY;};
const onKeyDown=e=>{if(['ArrowDown','PageDown',' ','ArrowUp'].includes(e.key)){if(!e.shiftKey&&e.key!=='ArrowUp'&&!engaged)engageSequence();else if(engaged)pauseForUser();}};
const onScroll=()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;const next=scrollY;if(next>lastObservedScroll+1)engageSequence();lastObservedScroll=next;});};
window.addEventListener('wheel',onWheel,{passive:true});
window.addEventListener('touchstart',onTouchStart,{passive:true});
window.addEventListener('touchmove',onTouchMove,{passive:true});
window.addEventListener('keydown',onKeyDown);
window.addEventListener('scroll',onScroll,{passive:true});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const dest=document.querySelector(a.getAttribute('href'));if(!dest)return;e.preventDefault();stopAutoplay();suppressActivation=true;dest.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});setTimeout(()=>{suppressActivation=false;lastObservedScroll=scrollY;},900);if(dest.id!=='home'){dest.setAttribute('tabindex','-1');dest.focus({preventScroll:true});}}));

const stays={rooms:{title:'Comfort comes<br>naturally.',text:'Choose Executive Deluxe, Royal Superior or the Studio Room for your next stay.',amenities:['Air conditioning','Wi-Fi','Smart TV','Breakfast'],link:'Enquire about rooms'},suites:{title:'Settle in.<br>Stay a little longer.',text:'Explore the Diplomatic and Presidential Suites, with room to relax and space to make your own.',amenities:['Living space','Kitchenette','Dining table','Wi-Fi'],link:'Enquire about suites'},annex:{title:'A comfortable<br>change of scene.',text:'Discover Standard Deluxe, Royal Deluxe and Executive Suite accommodation in the Annex.',amenities:['Air conditioning','Wi-Fi','Smart TV','Breakfast'],link:'Enquire about the Annex'}};
const tabs=[...document.querySelectorAll('[data-stay]')];
function selectTab(button){tabs.forEach(t=>{const selected=t===button;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});const data=stays[button.dataset.stay];const panel=document.querySelector('#stay-panel');panel.setAttribute('aria-labelledby',button.id);panel.innerHTML=`<h3>${data.title}</h3><p>${data.text}</p><ul class="amenities">${data.amenities.map(a=>`<li>${a}</li>`).join('')}</ul>`;const link=document.querySelector('#room-enquiry');link.innerHTML=`${data.link} <span aria-hidden="true">↗</span>`;link.href=`mailto:reservation@saintjacobshotel.com?subject=${encodeURIComponent(data.link)}`;}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectTab(t));t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();tabs[next].focus();selectTab(tabs[next]);}});});
const details=[...document.querySelectorAll('.experience-list details')];details.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)details.forEach(other=>{if(other!==d)other.open=false;});}));
const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('reveal-visible');revealObserver.unobserve(entry.target);}}},{rootMargin:'0px 0px 30px 0px',threshold:.03});
if(!reduce.matches){document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('reveal-pending');revealObserver.observe(el);});}
window.addEventListener('pagehide',e=>{if(e.persisted)return;stopped=true;stopAutoplay();resizeObserver.disconnect();heroObserver.disconnect();tourTrigger?.kill();revealObserver.disconnect();reduce.removeEventListener('change',onMotion);window.removeEventListener('resize',onResize);window.removeEventListener('wheel',onWheel);window.removeEventListener('touchstart',onTouchStart);window.removeEventListener('touchmove',onTouchMove);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('scroll',onScroll);if(renderRaf)cancelAnimationFrame(renderRaf);if(scrollRaf)cancelAnimationFrame(scrollRaf);if(idleHandle&&'cancelIdleCallback'in window)cancelIdleCallback(idleHandle);if(chunkTimer)clearTimeout(chunkTimer);frames.forEach(image=>{image.onload=null;image.onerror=null;image.src='';});loaded.clear();loading.clear();});
// Read-only diagnostics support browser verification without driving animation state.
window.hotelTour={get state(){return {target:target+1,painted:painted+1,decoded:loaded.size,downloaded:loaded.size,failed:failed.size,reducedMotion:reduce.matches,engaged,autoplay,progress:tourProgress};}};
