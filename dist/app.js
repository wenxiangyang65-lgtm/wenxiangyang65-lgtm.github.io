const projects=window.PORTFOLIO_PROJECTS;
const order=projects.map(p=>p.slug);
const orderedProjects=projects;
const albums=document.querySelector('#albums'),range=document.querySelector('#album-range'),previous=document.querySelector('#previous'),next=document.querySelector('#next'),catalogMotion=document.querySelector('#catalog-motion');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const pad=n=>String(n).padStart(2,'0');
let suppressRecordClickUntil=0,cycleWidth=0,pitch=0,position=0,lastFrame=0,interactionUntil=0,manualPaused=reduced.matches,hovered=false,focused=false,catalogVisible=false,albumDrag=null,initialized=false;
function recordMarkup(project){
 const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;').replaceAll("'",'&#39;');
 const p=Object.fromEntries(Object.entries(project).map(([key,value])=>[key,typeof value==='string'?escape(value):value]));
 if(p.template==='original')return `<img class="record-image" src="${p.card}" alt="${p.title}的原版唱片入口" width="418" height="360" draggable="false">${p.spin?`<span class="record-disc"><img src="${p.cover}" alt="" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><img class="record-tab" src="${p.tab}" alt="" draggable="false">`:''}`;
 return `<img class="record-image" src="assets/record-sleeve.webp" alt="" width="418" height="360" draggable="false"><span class="record-disc"><img src="${p.cover}" alt="${p.title}的项目封面" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><span class="new-tab"></span><span class="record-title">${p.label}</span><span class="record-role">【项目角色】<b>主设＆主创</b></span><span class="record-number">${pad(p.n)}</span><span class="record-year">${p.year}</span><span class="record-category">${p.category}</span>`;
}
for(let cycle=-1;cycle<=1;cycle++){
 const group=document.createElement('div');group.className='album-page';group.dataset.cycle=cycle;
 if(cycle===0){group.setAttribute('role','group');group.setAttribute('aria-label',`项目唱片目录，${projects.length}个项目`);}else group.setAttribute('aria-hidden','true');
 orderedProjects.forEach((p,index)=>{
  const a=document.createElement('a');a.className='record';a.href=`${p.entry}`;a.dataset.project=p.slug;a.dataset.order=index;a.title=p.title;a.setAttribute('aria-label',`${p.title}，点击查看项目`);if(cycle!==0)a.tabIndex=-1;
  a.style.setProperty('--disc-x',`${p.x||13.16}%`);a.style.setProperty('--disc-y',`${p.y||5.84}%`);a.style.setProperty('--disc-size',`${p.size||75.12}%`);a.innerHTML=recordMarkup(p);
  const select=()=>{document.querySelector('#selected-title').textContent=p.title;document.querySelector('#page-count').textContent=`${pad(index+1)} / ${projects.length}`};
  a.addEventListener('pointerenter',select);a.addEventListener('focus',select);
  a.addEventListener('click',e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
   if(performance.now()<suppressRecordClickUntil){e.preventDefault();return}
   e.preventDefault();rememberDirectory(p.slug);document.querySelector('.transition-curtain img').src=p.cover;
   if(reduced.matches){location.href=a.href;return}
   document.body.classList.add('is-opening');setTimeout(()=>location.href=a.href,180);
  });group.append(a);
 });albums.append(group);
}
function offset(){return cycleWidth?((albums.scrollLeft-cycleWidth)%cycleWidth+cycleWidth)%cycleWidth:0}
function measure(){const groups=albums.children,old=initialized&&cycleWidth>0?offset()/cycleWidth:0,newCycle=groups[1].offsetLeft-groups[0].offsetLeft,newPitch=groups[1].children[1].offsetLeft-groups[1].children[0].offsetLeft;if(newCycle<=0||newPitch<=0)return;cycleWidth=newCycle;pitch=newPitch;position=cycleWidth+(Number.isFinite(old)?old:0)*cycleWidth;albums.scrollLeft=position;initialized=true;syncControls()}
function syncControls(){if(!cycleWidth)return;const x=offset(),index=Math.min(projects.length-1,Math.floor((x+1)/pitch));range.value=Math.min(1,x/Math.max(1,cycleWidth-pitch));previous.disabled=false;next.disabled=false;if(!hovered&&!focused){document.querySelector('#selected-title').textContent=orderedProjects[index].title;document.querySelector('#page-count').textContent=`${pad(index+1)} / ${projects.length}`}}
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
