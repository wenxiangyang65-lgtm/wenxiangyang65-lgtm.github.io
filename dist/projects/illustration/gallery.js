(()=>{
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const works=[...document.querySelectorAll('[data-work]')];
const hub=document.getElementById('work-index');
const menu=document.getElementById('work-menu');
const box=document.getElementById('lightbox');
let current='',lastZoom=null;
const baseTitle='品牌 IP 与个人设计探索 · 杨文祥';
const preloaded=new Set();
function preloadProject(work){
 const paths=[...work.querySelectorAll('[data-asset]')].map(t=>t.dataset.asset);
 if(work.id==='asian-games')for(const id of ['chenchen','congcong','lianlian'])paths.push(`assets/asian-${id}.avif`,`assets/asian-${id}-clay.avif`);
 paths.forEach(src=>{if(preloaded.has(src))return;preloaded.add(src);const im=new Image();im.src=src;});
}
const header=document.querySelector('.site-head');
function sizeHeader(){document.documentElement.style.setProperty('--head-h',header.offsetHeight+'px');}
sizeHeader();if('ResizeObserver'in window)new ResizeObserver(sizeHeader).observe(header);
function route(){
 const raw=decodeURIComponent(location.hash.slice(1)),key=raw.split('--')[0];
 const legacy={'seeding':'operations-seeding','night-taobao':'operations-night-taobao','fuzi':'operations-fuzi','sofa':'operations-sofa','miaosuda-new-year':'operations-miaosuda-new-year'};
 if(legacy[key]){location.replace('../'+legacy[key]+'/index.html');return;}
 const next=works.find(w=>w.id===key),changed=current!==(next?.id||'');
 if(box.open)box.close();if(menu.open)menu.close();
 works.forEach(w=>{w.hidden=w!==next;});hub.hidden=Boolean(next);
 current=next?.id||'';
 if(next)preloadProject(next);
 document.title=next?next.querySelector('h1').textContent+' · 杨文祥':baseTitle;
 document.getElementById('head-category').textContent=next?(next.id==='service-ip'||next.id==='asian-games'?'BRAND IP / 3D DESIGN':'PERSONAL / VISUAL EXPLORATION'):'IP / VISUAL EXPLORATION';
 if(changed){window.scrollTo({top:0,behavior:'instant'});(next?.querySelector('h1')||hub.querySelector('h1')).setAttribute('tabindex','-1');}
 if(raw.includes('--'))requestAnimationFrame(()=>document.getElementById(raw)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'}));
 if(!next&&raw&&raw!=='work-index')history.replaceState(null,'','#work-index');
 syncTurn();spy();
}
window.addEventListener('hashchange',route);
document.getElementById('open-work-menu').addEventListener('click',()=>menu.showModal());
menu.querySelector('[data-close-menu]').addEventListener('click',()=>menu.close());
menu.addEventListener('click',ev=>{if(ev.target===menu)menu.close();if(ev.target.closest('a'))menu.close();});
// Full artwork is always available; detail crops never replace the original.
document.addEventListener('click',ev=>{
 const button=ev.target.closest('[data-zoom]');if(!button)return;
 lastZoom=button;
 const im=document.getElementById('lightbox-image'),stage=document.getElementById('lightbox-stage');
 im.src=button.dataset.zoom;im.alt=button.dataset.label;
 document.getElementById('lightbox-title').textContent=button.dataset.label;
 stage.classList.remove('zoomed');stage.scrollTop=0;stage.scrollLeft=0;
 const zoom=document.getElementById('lightbox-zoom');zoom.textContent='放大细节';zoom.setAttribute('aria-pressed','false');
 box.showModal();document.getElementById('lightbox-close').focus();
});
document.getElementById('lightbox-close').addEventListener('click',()=>box.close());
box.addEventListener('click',ev=>{if(ev.target===box)box.close();});
box.addEventListener('close',()=>lastZoom?.focus({preventScroll:true}));
document.getElementById('lightbox-zoom').addEventListener('click',ev=>{
 const stage=document.getElementById('lightbox-stage'),im=document.getElementById('lightbox-image');
 const zoomed=stage.classList.toggle('zoomed');
 stage.style.setProperty('--zoom-width',Math.max(im.naturalWidth,stage.clientWidth*1.65)+'px');
 ev.currentTarget.setAttribute('aria-pressed',String(zoomed));ev.currentTarget.textContent=zoomed?'适合屏幕':'放大细节';
});
// Reusable tab navigation keeps buttons, panel, caption and original-image link in sync.
function keyboardTabs(list,selector){
 list.addEventListener('keydown',ev=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
  const tabs=[...list.querySelectorAll(selector)],at=tabs.indexOf(document.activeElement);if(at<0)return;
  ev.preventDefault();const i=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(at+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  tabs[i].focus();tabs[i].click();
 });
}
document.querySelectorAll('[data-selector]').forEach(list=>{
 const panel=document.getElementById(list.dataset.selector),button=panel.querySelector('[data-zoom]'),im=button.querySelector('img');
 list.addEventListener('click',ev=>{
  const tab=ev.target.closest('[role=tab]');if(!tab)return;
  [...list.children].forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
  const asset=tab.dataset.asset;panel.dataset.pending=asset;panel.setAttribute('aria-busy','true');
  const loaded=new Image();
  function show(){
   if(panel.dataset.pending!==asset)return;
   im.src=asset;im.alt=tab.dataset.name;im.width=loaded.naturalWidth;im.height=loaded.naturalHeight;
   button.dataset.zoom=asset;button.dataset.label=tab.dataset.name;button.setAttribute('aria-label','放大查看：'+tab.dataset.name);
   panel.setAttribute('aria-labelledby',tab.id);panel.removeAttribute('aria-busy');
   const i=[...list.children].indexOf(tab)+1;list.parentElement.querySelector('.selector-count').textContent=String(i).padStart(2,'0')+' / '+String(list.children.length).padStart(2,'0');
  }
  loaded.onload=show;loaded.onerror=()=>{if(panel.dataset.pending===asset)panel.removeAttribute('aria-busy');};loaded.src=asset;
 });keyboardTabs(list,'[role=tab]');
});
// The clay-to-final comparison uses paired source renders with a native range control.
const compare=document.getElementById('asian-compare');
compare.querySelector('input').addEventListener('input',ev=>compare.style.setProperty('--split',ev.target.value+'%'));
const asianNames={chenchen:['宸宸','以蓝绿纸层和水波轮廓，组织角色与背景的前后关系。'],congcong:['琮琮','以植物、山形和暖色纸层，建立繁茂而轻盈的空间层次。'],lianlian:['莲莲','以荷叶、花瓣和曲线纸层，保持角色与环境的流动感。']};
const asianTabs=document.querySelector('[data-asian]').parentElement;
asianTabs.addEventListener('click',ev=>{
 const tab=ev.target.closest('[data-asian]');if(!tab)return;
 const id=tab.dataset.asian,[name,desc]=asianNames[id];
 asianTabs.querySelectorAll('[data-asian]').forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
 const clay=document.getElementById('compare-clay'),final=document.getElementById('compare-final');
 clay.src=`assets/asian-${id}-clay.avif`;clay.alt=name+' · 白模';final.src=`assets/asian-${id}.avif`;final.alt=name+' · 材质与灯光成稿';
 document.getElementById('compare-name').textContent=name;document.getElementById('compare-description').textContent=desc;
});keyboardTabs(asianTabs,'[data-asian]');
// Filtering changes only the selected collection; image dialogs retain the full artwork.
const filters=document.querySelector('.filter-list');
filters.addEventListener('click',ev=>{
 const tab=ev.target.closest('[data-filter]');if(!tab)return;const filter=tab.dataset.filter;
 filters.querySelectorAll('button').forEach(t=>t.setAttribute('aria-pressed',String(t===tab)));
 let count=0;document.querySelectorAll('[data-poster-category]').forEach(item=>{item.hidden=filter!=='all'&&item.dataset.posterCategory!==filter;if(!item.hidden)count++;});
 document.querySelector('.gallery-count').textContent=count+' 张海报';
});
// Genuine source turntable frames. Dragging changes the angle; scrolling remains native.
const turn=document.getElementById('service-turntable'),turnImage=turn.querySelector('img'),range=document.getElementById('turn-range'),play=document.getElementById('turn-play');
let turnVisible=false,turnEnabled=!reduced.matches,turnTimer=null,turnIndex=0,frames=null,drag=null;
function loadFrames(){
 if(frames)return;frames=Array.from({length:24},(_,i)=>{const im=new Image();im.src=`assets/service-turn-${String(i).padStart(2,'0')}.avif`;return im;});
 turn.dataset.ready='true';
}
function setAngle(i){
 loadFrames();i=(i+24)%24;const frame=frames[i];
 if(!frame.complete||!frame.naturalWidth){frame.addEventListener('load',()=>{if(turnIndex===i)turnImage.src=frame.src;},{once:true});}
 else turnImage.src=frame.src;
 turnIndex=i;range.value=String(i);range.setAttribute('aria-valuetext',i*15+'度');document.getElementById('turn-degree').textContent=String(i*15).padStart(3,'0')+'°';
}
function syncTurn(){
 clearInterval(turnTimer);turnTimer=null;
 play.textContent=turnEnabled?'暂停旋转':'播放旋转';play.setAttribute('aria-pressed',String(turnEnabled));
 if(current==='service-ip'&&turnVisible&&turnEnabled&&!document.hidden&&!box.open){loadFrames();turnTimer=setInterval(()=>setAngle(turnIndex+1),125);}
}
function manualAngle(i){turnEnabled=false;syncTurn();setAngle(i);}
play.addEventListener('click',()=>{turnEnabled=!turnEnabled;syncTurn();});
range.addEventListener('input',ev=>manualAngle(Number(ev.target.value)));
document.querySelectorAll('[data-turn]').forEach(button=>button.addEventListener('click',()=>manualAngle(Number(button.dataset.turn))));
turn.addEventListener('keydown',ev=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;ev.preventDefault();manualAngle(ev.key==='Home'?0:ev.key==='End'?23:turnIndex+(ev.key==='ArrowRight'?1:-1));});
turn.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;drag={x:ev.clientX,y:ev.clientY,i:turnIndex,started:false};});
turn.addEventListener('pointermove',ev=>{
 if(!drag)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
 if(!drag.started&&Math.abs(dy)>Math.abs(dx)+6){drag=null;return;}
 if(!drag.started&&Math.abs(dx)>8){drag.started=true;turn.setPointerCapture(ev.pointerId);turn.classList.add('dragging');}
 if(drag.started)manualAngle(drag.i+Math.round(dx/12));
});
function stopDrag(){drag=null;turn.classList.remove('dragging');}
turn.addEventListener('pointerup',stopDrag);turn.addEventListener('pointercancel',stopDrag);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{turnVisible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;syncTurn();},{threshold:[0,.15]}).observe(turn);else turnVisible=true;
document.addEventListener('visibilitychange',syncTurn);box.addEventListener('close',syncTurn);box.addEventListener('toggle',syncTurn);
reduced.addEventListener('change',()=>{if(reduced.matches)turnEnabled=false;syncTurn();});
// Highlight the current chapter without pinning or replacing the user's scroll position.
let scrollTick=false;
function spy(){
 scrollTick=false;const work=works.find(w=>w.id===current);if(!work)return;
 const sections=[...work.querySelectorAll('.content-section')];let active=sections[0]?.id;
 sections.forEach(section=>{if(section.getBoundingClientRect().top<=175)active=section.id;});
 work.querySelectorAll('.chapter-nav a').forEach(link=>{if(link.hash==='#'+active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
}
window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(spy);}},{passive:true});
route();
})();
