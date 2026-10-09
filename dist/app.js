const projects=window.PORTFOLIO_PROJECTS;
const order=projects.map(p=>p.slug);
const orderedProjects=projects;
const albums=document.querySelector('#albums'),range=document.querySelector('#album-range'),previous=document.querySelector('#previous'),next=document.querySelector('#next'),catalogMotion=document.querySelector('#catalog-motion');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const pad=n=>String(n).padStart(2,'0');
let suppressRecordClickUntil=0;
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
const {rememberDirectory,restoreDirectory}=window.createPortfolioCatalogMotion({albums,range,previous,next,catalogMotion,projects,reduced,onSuppressClick:time=>{suppressRecordClickUntil=time}});
if(matchMedia('(hover:hover) and (pointer:fine)').matches)document.querySelectorAll('.record').forEach(record=>{record.addEventListener('pointermove',e=>{const r=record.getBoundingClientRect();record.style.setProperty('--record-angle',`${(e.clientX-r.left)/r.width*8-4}deg`)});record.addEventListener('pointerleave',()=>record.style.removeProperty('--record-angle'))});
const sections=[...document.querySelectorAll('.screen')],dots=document.querySelectorAll('.page-dots a');let sectionRAF=0;
function sectionMarker(){const anchor=scrollY+innerHeight*.25;let current=sections[0];for(const section of sections)if(section.offsetTop<=anchor)current=section;dots.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
addEventListener('scroll',()=>{cancelAnimationFrame(sectionRAF);sectionRAF=requestAnimationFrame(sectionMarker)},{passive:true});addEventListener('resize',sectionMarker);sectionMarker();
const video=document.querySelector('#cover-video'),toggle=document.querySelector('#motion-toggle');let paused=reduced.matches,coverVisible=true;
function startVideo(){if(paused||!coverVisible||document.hidden)return;if(!video.src){video.src=video.dataset.src;video.load()}video.play().catch(()=>{})}
function updateMotion(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放封面动态':'暂停封面动态');toggle.querySelector('.tooltip').textContent=paused?'播放动态':'暂停动态';if(paused)video.pause();else startVideo()}
toggle.addEventListener('click',()=>{paused=!paused;updateMotion()});video.addEventListener('playing',()=>video.classList.add('ready'));video.addEventListener('error',()=>video.classList.remove('ready'));
new IntersectionObserver(entries=>{coverVisible=entries[0].isIntersecting;if(coverVisible)startVideo();else video.pause()},{threshold:.1}).observe(document.querySelector('#cover'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startVideo()});updateMotion();restoreDirectory();
