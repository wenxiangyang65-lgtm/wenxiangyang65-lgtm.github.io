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
const albums=document.querySelector('#albums');
const pad=n=>String(n).padStart(2,'0');
for(let start=0;start<projects.length;start+=8){
 const group=document.createElement('div');group.className='album-page';group.setAttribute('role','group');group.setAttribute('aria-label',`项目 ${start+1} 至 ${Math.min(start+8,projects.length)}`);
 projects.slice(start,start+8).forEach(p=>{
  const a=document.createElement('a');a.className='record';a.href=`projects/${p.slug}/index.html`;a.dataset.project=p.slug;a.setAttribute('aria-label',`${pad(p.n)} · ${p.title}，点击查看项目`);a.title=p.title;
  if(p.n<=8){
   a.style.setProperty('--disc-x',`${p.x||13.16}%`);a.style.setProperty('--disc-y',`${p.y||5.84}%`);a.style.setProperty('--disc-size',`${p.size||75.12}%`);
   a.innerHTML=`<img class="record-image" src="assets/card-${pad(p.n)}.webp" alt="${p.title}的原版唱片入口" loading="lazy" draggable="false">${p.spin?`<span class="record-disc"><img src="assets/disc-${pad(p.n)}.webp" alt="" loading="lazy" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><img class="record-tab" src="assets/tab-${pad(p.n)}.webp" alt="" loading="lazy" draggable="false">`:''}`;
  }else{
   a.innerHTML=`<img class="record-image" src="assets/record-sleeve.webp" alt="" loading="lazy" draggable="false"><span class="record-disc${p.poster?' poster-disc':''}" ${p.poster?`style="--poster-art:url('assets/disc-${p.slug}.webp')"`:""}><img src="assets/disc-${p.slug}.webp?v=20261007-circle" alt="${p.title}的${p.poster?'完整封面海报':'项目画面'}" loading="lazy" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><span class="new-tab"></span><span class="record-title">${p.label}</span><span class="record-role">【项目角色】<b>主设＆主创</b></span><span class="record-number">${pad(p.n)}</span><span class="record-year">${p.year}</span><span class="record-category">${p.slug==='xinxuan-views'?'角色三视图':p.slug==='xujie'?'整合营销':'AIGC 影像'}</span>`;
  }
  const select=()=>document.querySelector('#selected-title').textContent=p.title;
  a.addEventListener('pointerenter',select);a.addEventListener('focus',select);
  a.addEventListener('click',e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
   e.preventDefault();rememberDirectory(p.slug);document.querySelector('.transition-curtain img').src=`assets/${p.n<=8&&p.spin?'disc-'+pad(p.n):p.n<=8?'card-'+pad(p.n):'disc-'+p.slug}.webp?v=20261007-circle`;
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){location.href=a.href;return}
   document.body.classList.add('is-opening');setTimeout(()=>{location.href=a.href},220);
  });group.append(a);
 });albums.append(group);
}
const range=document.querySelector('#album-range'),previous=document.querySelector('#previous'),next=document.querySelector('#next');
function maxScroll(){return Math.max(0,albums.scrollWidth-albums.clientWidth)}
let scrollRAF=0;
function syncControls(){const max=maxScroll();range.value=max?albums.scrollLeft/max:0;previous.disabled=albums.scrollLeft<3;next.disabled=albums.scrollLeft>=max-3;const second=Number(range.value)>.45;document.querySelector('#page-count').textContent=second?'09—15 / 15':'01—08 / 15'}
albums.addEventListener('scroll',()=>{cancelAnimationFrame(scrollRAF);scrollRAF=requestAnimationFrame(syncControls)},{passive:true});
range.addEventListener('input',()=>{albums.style.scrollSnapType='none';albums.scrollLeft=Number(range.value)*maxScroll()});range.addEventListener('change',()=>{albums.style.scrollSnapType=''});
function move(direction){albums.scrollBy({left:direction*albums.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
albums.addEventListener('keydown',e=>{if(e.target!==albums)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
albums.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const atStart=albums.scrollLeft<1,atEnd=albums.scrollLeft>=maxScroll()-1;if((e.deltaY<0&&atStart)||(e.deltaY>0&&atEnd))return;e.preventDefault();albums.scrollLeft+=e.deltaY},{passive:false});
window.addEventListener('resize',syncControls);requestAnimationFrame(syncControls);
function rememberDirectory(slug){try{sessionStorage.setItem('portfolio-directory',JSON.stringify({scroll:albums.scrollLeft,width:albums.clientWidth,slug}));}catch{}}
function restoreDirectory(){document.body.classList.remove('is-opening');if(location.hash!=='#catalog')return;let state;try{state=JSON.parse(sessionStorage.getItem('portfolio-directory')||'null')}catch{}if(state){albums.style.scrollSnapType='none';albums.scrollLeft=state.scroll;requestAnimationFrame(()=>{albums.style.scrollSnapType='';syncControls()});const a=albums.querySelector(`[data-project="${state.slug}"]`);if(a){if(state.width!==albums.clientWidth)a.scrollIntoView({block:'nearest',inline:'start',behavior:'instant'});document.querySelector('#selected-title').textContent=projects.find(p=>p.slug===state.slug).title;}}}
window.addEventListener('pageshow',restoreDirectory);window.addEventListener('hashchange',restoreDirectory);
const sections=document.querySelectorAll('.screen'),dots=document.querySelectorAll('.page-dots a');
const video=document.querySelector('#cover-video'),toggle=document.querySelector('#motion-toggle');let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;let coverVisible=true;
function startVideo(){if(paused||!coverVisible||document.hidden)return;if(!video.src){video.src=video.dataset.src;video.load()}video.play().catch(()=>{})}
function updateMotion(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放封面动态':'暂停封面动态');toggle.querySelector('.tooltip').textContent=paused?'播放动态':'暂停动态';if(paused){video.pause();video.classList.remove('ready')}else startVideo()}
toggle.addEventListener('click',()=>{paused=!paused;updateMotion()});video.addEventListener('playing',()=>video.classList.add('ready'));video.addEventListener('error',()=>video.classList.remove('ready'));
new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){dots.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));dots.forEach(a=>a.classList.contains('active')?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));}if(entry.target.id==='cover'){coverVisible=entry.isIntersecting;if(coverVisible)startVideo();else video.pause()}})},{threshold:.55}).observe(document.querySelector('#cover'));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){dots.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}),{threshold:.35});sections.forEach(s=>observer.observe(s));
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startVideo()});updateMotion();restoreDirectory();
