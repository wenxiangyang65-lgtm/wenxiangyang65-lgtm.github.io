const projects=[
 {n:1,slug:'awe',title:'AWE 展会 · 到生活里 AI',year:2025,x:13.16,y:5.84,size:75.12,spin:true},
 {n:2,slug:'new-year',title:'天猫家享生活年货节视觉设计',year:2024,x:10.81,y:5.84,size:77.15,spin:true},
 {n:3,slug:'dunhuang',title:'天猫家享 · 大过中国年与敦煌奇境',year:2024,spin:false},
 {n:4,slug:'new-world',title:'AWE 展会 · 串门发现新世界',year:2024,spin:false},
 {n:5,slug:'trade-in',title:'以旧换新与政府补贴 / 国补',year:2025,x:14.32,y:5.56,size:75.42,spin:true},
 {n:6,slug:'miaosuda',title:'喵速达两周年主视觉设计',year:2024,x:10.81,y:5.84,size:77.15,spin:true},
 {n:7,slug:'aigc',title:'AIGC 研究与应用',year:2025,x:12.95,y:5.84,size:75.3,spin:true},
 {n:8,slug:'illustration',title:'插画与三维设计',year:2025,x:12.74,y:5.84,size:75.48,spin:true},
 {n:9,slug:'churuixue',title:'初瑞雪 · 逆境中开花',label:'初瑞雪·逆境中开花',year:2026},
 {n:10,slug:'xinxuan-redesign',title:'辛选年货为你而来 · 重设计版',label:'辛选年货为你而来·重设计',year:2026},
 {n:11,slug:'a-horse',title:'许我一匹马吧',label:'许我一匹马吧',year:2026},
 {n:12,slug:'spring-horse',title:'骏马迎春，步步生花',label:'骏马迎春·步步生花',year:2026},
 {n:13,slug:'xujie',title:'徐杰拜师整合营销',label:'徐杰拜师整合营销',year:2026},
 {n:14,slug:'mr-chen',title:'陈先生 · 向全网亮剑',label:'陈先生·向全网亮剑',year:2026},
 {n:15,slug:'xinxuan-views',title:'辛选年货为你而来 · 三视图交互',label:'辛选年货为你而来·三视图',year:2026}
];

const order=['trade-in','awe','new-world','new-year','dunhuang','miaosuda','aigc','illustration','churuixue','xinxuan-redesign','a-horse','spring-horse','xujie','mr-chen','xinxuan-views'];
const orderedProjects=order.map(slug=>projects.find(p=>p.slug===slug));
const albums=document.querySelector('#albums'),range=document.querySelector('#album-range'),previous=document.querySelector('#previous'),next=document.querySelector('#next'),catalogMotion=document.querySelector('#catalog-motion');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const pad=n=>String(n).padStart(2,'0');
let suppressRecordClickUntil=0,cycleWidth=0,pitch=0,position=0,lastFrame=0,interactionUntil=0,manualPaused=reduced.matches,hovered=false,focused=false,catalogVisible=false,albumDrag=null,initialized=false;
function recordMarkup(p){
 if(p.n<=8)return `<img class="record-image" src="assets/card-${pad(p.n)}.webp" alt="${p.title}的原版唱片入口" width="418" height="360" draggable="false">${p.spin?`<span class="record-disc"><img src="assets/disc-${pad(p.n)}.webp" alt="" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><img class="record-tab" src="assets/tab-${pad(p.n)}.webp" alt="" draggable="false">`:''}`;
 return `<img class="record-image" src="assets/record-sleeve.webp" alt="" width="418" height="360" draggable="false"><span class="record-disc"><img src="assets/disc-${p.slug}.webp?v=20261007-circle" alt="${p.title}的项目封面" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><span class="new-tab"></span><span class="record-title">${p.label}</span><span class="record-role">【项目角色】<b>主设＆主创</b></span><span class="record-number">${pad(p.n)}</span><span class="record-year">${p.year}</span><span class="record-category">${p.slug==='xinxuan-views'?'角色三视图':p.slug==='xujie'?'整合营销':'AIGC 影像'}</span>`;
}
for(let cycle=-1;cycle<=1;cycle++){
 const group=document.createElement('div');group.className='album-page';group.dataset.cycle=cycle;
 if(cycle===0){group.setAttribute('role','group');group.setAttribute('aria-label','项目唱片目录，15个项目');}else group.setAttribute('aria-hidden','true');
 orderedProjects.forEach((p,index)=>{
  const a=document.createElement('a');a.className='record';a.href=`projects/${p.slug}/index.html`;a.dataset.project=p.slug;a.dataset.order=index;a.title=p.title;a.setAttribute('aria-label',`${p.title}，点击查看项目`);if(cycle!==0)a.tabIndex=-1;
  a.style.setProperty('--disc-x',`${p.x||13.16}%`);a.style.setProperty('--disc-y',`${p.y||5.84}%`);a.style.setProperty('--disc-size',`${p.size||75.12}%`);a.innerHTML=recordMarkup(p);
  const select=()=>{document.querySelector('#selected-title').textContent=p.title;document.querySelector('#page-count').textContent=`${pad(index+1)} / 15`};
  a.addEventListener('pointerenter',select);a.addEventListener('focus',select);
  a.addEventListener('click',e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
   if(performance.now()<suppressRecordClickUntil){e.preventDefault();return}
   e.preventDefault();rememberDirectory(p.slug);document.querySelector('.transition-curtain img').src=`assets/${p.n<=8&&p.spin?'disc-'+pad(p.n):p.n<=8?'card-'+pad(p.n):'disc-'+p.slug}.webp?v=20261007-circle`;
   if(reduced.matches){location.href=a.href;return}
   document.body.classList.add('is-opening');setTimeout(()=>location.href=a.href,180);
  });group.append(a);
 });albums.append(group);
}
function offset(){return cycleWidth?((albums.scrollLeft-cycleWidth)%cycleWidth+cycleWidth)%cycleWidth:0}
function measure(){const groups=albums.children,old=initialized&&cycleWidth>0?offset()/cycleWidth:0,newCycle=groups[1].offsetLeft-groups[0].offsetLeft,newPitch=groups[1].children[1].offsetLeft-groups[1].children[0].offsetLeft;if(newCycle<=0||newPitch<=0)return;cycleWidth=newCycle;pitch=newPitch;position=cycleWidth+(Number.isFinite(old)?old:0)*cycleWidth;albums.scrollLeft=position;initialized=true;syncControls()}
function syncControls(){if(!cycleWidth)return;const x=offset(),index=Math.min(14,Math.floor((x+1)/pitch));range.value=Math.min(1,x/Math.max(1,cycleWidth-pitch));previous.disabled=false;next.disabled=false;if(!hovered&&!focused){document.querySelector('#selected-title').textContent=orderedProjects[index].title;document.querySelector('#page-count').textContent=`${pad(index+1)} / 15`}}
function interact(ms=7000){interactionUntil=performance.now()+ms;position=albums.scrollLeft}
function wrap(){if(!cycleWidth)return;while(position>=cycleWidth*2)position-=cycleWidth;while(position<cycleWidth)position+=cycleWidth}
function frame(time){const dt=lastFrame?Math.min(50,time-lastFrame):0;lastFrame=time;if(initialized&&catalogVisible&&!manualPaused&&!hovered&&!focused&&!albumDrag&&!document.hidden&&time>interactionUntil){position+=dt*.03;wrap();albums.scrollLeft=position;syncControls()}requestAnimationFrame(frame)}
albums.addEventListener('scroll',()=>{if(performance.now()<interactionUntil||albumDrag)position=albums.scrollLeft;syncControls()},{passive:true});
albums.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true});albums.addEventListener('pointerleave',()=>{hovered=false;position=albums.scrollLeft});
albums.addEventListener('focusin',()=>{focused=true});albums.addEventListener('focusout',()=>{focused=albums.contains(document.activeElement);position=albums.scrollLeft});
albums.addEventListener('wheel',e=>{interact();if(e.shiftKey&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();albums.scrollLeft+=e.deltaY}},{passive:false});
range.addEventListener('input',()=>{interact();albums.scrollLeft=cycleWidth+Number(range.value)*Math.max(0,cycleWidth-pitch);position=albums.scrollLeft});
function move(direction){interact();position=albums.scrollLeft;wrap();albums.scrollLeft=position;albums.scrollBy({left:direction*pitch,behavior:reduced.matches?'instant':'smooth'})}
previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
albums.addEventListener('keydown',e=>{if(e.target!==albums)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
function updateCatalogMotion(){catalogMotion.textContent=manualPaused?'继续滚动':'暂停滚动';catalogMotion.setAttribute('aria-pressed',String(manualPaused));catalogMotion.setAttribute('aria-label',manualPaused?'继续项目自动滚动':'暂停项目自动滚动')}
catalogMotion.addEventListener('click',()=>{manualPaused=!manualPaused;position=albums.scrollLeft;if(!manualPaused)interactionUntil=0;updateCatalogMotion()});reduced.addEventListener('change',()=>{manualPaused=reduced.matches;updateCatalogMotion()});
albums.addEventListener('pointerdown',e=>{interact();if(e.pointerType!=='mouse'||e.button!==0)return;albumDrag={id:e.pointerId,x:e.clientX,y:e.clientY,start:albums.scrollLeft,active:false}});
albums.addEventListener('pointermove',e=>{if(!albumDrag||e.pointerId!==albumDrag.id)return;const dx=e.clientX-albumDrag.x,dy=e.clientY-albumDrag.y;if(!albumDrag.active&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)){albumDrag.active=true;albums.setPointerCapture(e.pointerId);albums.classList.add('is-dragging')}if(albumDrag.active){e.preventDefault();albums.scrollLeft=albumDrag.start-dx}});
function finishDrag(){if(albumDrag?.active){suppressRecordClickUntil=performance.now()+320;albums.classList.remove('is-dragging')}albumDrag=null;interact()}
albums.addEventListener('pointerup',finishDrag);albums.addEventListener('pointercancel',finishDrag);document.addEventListener('pointerup',()=>{if(albumDrag)finishDrag()});albums.addEventListener('dragstart',e=>e.preventDefault());
if(matchMedia('(hover:hover) and (pointer:fine)').matches)document.querySelectorAll('.record').forEach(record=>{record.addEventListener('pointermove',e=>{const r=record.getBoundingClientRect();record.style.setProperty('--record-angle',`${(e.clientX-r.left)/r.width*8-4}deg`)});record.addEventListener('pointerleave',()=>record.style.removeProperty('--record-angle'))});
function rememberDirectory(slug){try{sessionStorage.setItem('portfolio-directory',JSON.stringify({fraction:offset()/cycleWidth,slug,mode:'marquee'}))}catch{}}
function restoreDirectory(){document.body.classList.remove('is-opening');if(location.hash!=='#catalog'||!initialized)return;let state;try{state=JSON.parse(sessionStorage.getItem('portfolio-directory')||'null')}catch{}if(state){const index=order.indexOf(state.slug);position=cycleWidth+(state.mode==='marquee'?state.fraction*cycleWidth:Math.max(0,index)*pitch);albums.scrollLeft=position;interact(8000);syncControls();if(index>=0)document.querySelector('#selected-title').textContent=orderedProjects[index].title}}
new ResizeObserver(measure).observe(albums);
window.addEventListener('pageshow',restoreDirectory);window.addEventListener('hashchange',restoreDirectory);
new IntersectionObserver(entries=>{catalogVisible=entries[0].isIntersecting},{threshold:.12}).observe(albums);
measure();updateCatalogMotion();requestAnimationFrame(frame);
const sections=[...document.querySelectorAll('.screen')],dots=document.querySelectorAll('.page-dots a');let sectionRAF=0;
function sectionMarker(){const anchor=scrollY+innerHeight*.25;let current=sections[0];for(const section of sections)if(section.offsetTop<=anchor)current=section;dots.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
addEventListener('scroll',()=>{cancelAnimationFrame(sectionRAF);sectionRAF=requestAnimationFrame(sectionMarker)},{passive:true});addEventListener('resize',sectionMarker);sectionMarker();
const video=document.querySelector('#cover-video'),toggle=document.querySelector('#motion-toggle');let paused=reduced.matches,coverVisible=true;
function startVideo(){if(paused||!coverVisible||document.hidden)return;if(!video.src){video.src=video.dataset.src;video.load()}video.play().catch(()=>{})}
function updateMotion(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放封面动态':'暂停封面动态');toggle.querySelector('.tooltip').textContent=paused?'播放动态':'暂停动态';if(paused)video.pause();else startVideo()}
toggle.addEventListener('click',()=>{paused=!paused;updateMotion()});video.addEventListener('playing',()=>video.classList.add('ready'));video.addEventListener('error',()=>video.classList.remove('ready'));
new IntersectionObserver(entries=>{coverVisible=entries[0].isIntersecting;if(coverVisible)startVideo();else video.pause()},{threshold:.1}).observe(document.querySelector('#cover'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startVideo()});updateMotion();restoreDirectory();
