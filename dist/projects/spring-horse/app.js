'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const actors=['狐狸','狐狸','白马','黑熊','兔子','兔子','熊猫','黑熊','雄狮','海豹','小狗','松鼠'];
let voiceId=0;
$$('.voice').forEach(el=>{
  const actor=Number(el.dataset.actor),p=el.querySelector('p'),more=el.dataset.more;
  const button=document.createElement('button');button.className='voice-avatar';button.type='button';
  button.setAttribute('aria-label',`${actors[actor]}的旁白：展开设计解说`);button.setAttribute('aria-expanded','false');
  const avatar=document.createElement('img');avatar.src=`assets/animal-${actor}.webp?revision=20261022-animal-match`;avatar.alt=actors[actor];avatar.loading='lazy';avatar.width=70;avatar.height=90;button.append(avatar);
  const copy=document.createElement('div');copy.className='voice-copy';
  const label=document.createElement('div');label.className='voice-label';label.textContent=`${actors[actor]}的旁白`;
  const hint=document.createElement('em');hint.textContent='点我展开';label.append(hint);copy.append(label,p);
  const detail=document.createElement('p');detail.className='voice-more';detail.id=`voice-detail-${++voiceId}`;detail.hidden=true;detail.textContent=more;
  button.setAttribute('aria-controls',detail.id);copy.append(detail);el.append(button,copy);
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));button.setAttribute('aria-label',`${actors[actor]}的旁白：${open?'展开':'收起'}设计解说`);detail.hidden=open;hint.textContent=open?'点我展开':'收起解说';});
});
const progress=$('.reading-progress'),heroImage=$('.hero-scene>img'),navLinks=$$('.site-header nav a');
let ticking=false;
function scrollUpdate(){
 const d=document.documentElement,y=window.scrollY;
 progress.style.width=`${y/Math.max(1,d.scrollHeight-d.clientHeight)*100}%`;
 if(!reduced.matches&&y<1200)heroImage.style.setProperty('--hero-y',`${Math.min(y*.09,65)}px`);
 let current='';navLinks.forEach(a=>{const section=$(a.getAttribute('href'));if(section.getBoundingClientRect().top<180)current=a.getAttribute('href');});
 navLinks.forEach(a=>a.getAttribute('href')===current?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
 ticking=false;
}
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(scrollUpdate);}},{passive:true});
function setViewport(){document.documentElement.style.setProperty('--viewport',`${document.documentElement.clientWidth}px`);scrollUpdate();}
window.addEventListener('resize',setViewport);setViewport();
if('IntersectionObserver'in window&&!reduced.matches){
 document.documentElement.classList.add('js-motion');
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}});},{threshold:.07,rootMargin:'0px 0px 30px 0px'});
 $$('.reveal').forEach(el=>observer.observe(el));
}
const imageDialog=$('#image-dialog'),filmDialog=$('#film-dialog'),video=filmDialog.querySelector('video');
function openImage(src,caption){$('#dialog-image').src=src;$('#dialog-image').alt=caption;$('#image-dialog-caption').textContent=caption;document.body.classList.add('dialog-open');imageDialog.showModal();syncStoryPlayback();syncFramePlayback();}
$$('[data-image]').forEach(b=>b.addEventListener('click',()=>openImage(b.dataset.image,b.dataset.caption||b.parentElement.querySelector('img').alt)));
[imageDialog,filmDialog].forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(dialog===filmDialog)video.pause();syncStoryPlayback();syncFramePlayback();});
});
function openFilm(start=0){
 const source=video.querySelector('source');
 if(!source.getAttribute('src')){source.src=source.dataset.src;video.load();}
 const seek=()=>{video.currentTime=Math.min(start,Math.max(0,video.duration-.05));};
 if(video.readyState>=1)seek();else video.addEventListener('loadedmetadata',seek,{once:true});
 $('.video-error').hidden=true;document.body.classList.add('dialog-open');filmDialog.showModal();syncStoryPlayback();syncFramePlayback();video.play().catch(()=>{});
}
$$('[data-open-film]').forEach(b=>b.addEventListener('click',()=>openFilm()));
video.addEventListener('error',()=>$('.video-error').hidden=false);
let acts=[];
let storyAct=0,frames=[],frameIndex=0,frameAct='all',pendingAct=null;

const storyVideo=$('#story-video'),storyPlayToggle=$('#story-play-toggle'),storyVideoStatus=$('#story-video-status');
let storyVisible=false,storyPaused=reduced.matches;
function showStoryPlayback(){
 const playing=!storyVideo.paused&&!storyVideo.ended;
 storyPlayToggle.textContent=playing?'暂停片段':'播放片段';
 storyPlayToggle.setAttribute('aria-pressed',String(playing));
}
function syncStoryPlayback(){
 if(!storyVisible||document.hidden||storyPaused||filmDialog.open||imageDialog.open){storyVideo.pause();showStoryPlayback();return;}
 const src=storyVideo.dataset.clip;if(!src)return;
 if(storyVideo.getAttribute('src')!==src){storyVideo.src=src;storyVideo.load();}
 storyVideo.muted=true;storyVideo.defaultMuted=true;
 storyVideo.play().catch(error=>{if(error.name!=='AbortError')showStoryPlayback();});
}
storyPlayToggle.addEventListener('click',()=>{
 storyPaused=!storyVideo.paused;
 if(!storyPaused){storyVideoStatus.hidden=true;if(storyVideo.error){storyVideo.load();}}
 syncStoryPlayback();
});
['play','pause','ended'].forEach(name=>storyVideo.addEventListener(name,showStoryPlayback));
storyVideo.addEventListener('error',()=>{storyVideoStatus.hidden=false;showStoryPlayback();});
if('IntersectionObserver'in window){
 new IntersectionObserver(entries=>{storyVisible=entries[0].isIntersecting;syncStoryPlayback();},{threshold:.1}).observe(storyVideo);
}else{storyVisible=true;}
document.addEventListener('visibilitychange',syncStoryPlayback);
reduced.addEventListener('change',()=>{if(reduced.matches){storyPaused=true;syncStoryPlayback();}});

function changeImage(img,src,alt){
 img.alt=alt;img.classList.add('is-changing');img.src=src;
 const show=()=>{if(img.getAttribute('src')===src)img.classList.remove('is-changing');};
 if(img.decode)img.decode().then(show,show);else{img.onload=show;img.onerror=show;}
}
function setStory(index){
 const a=acts[index];if(!a)return;storyAct=index;
 $$('.act-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
 $('#story-panel').setAttribute('aria-labelledby',`story-tab-${index}`);
 storyVideo.pause();
 storyVideo.poster=a.image;storyVideo.setAttribute('aria-label',a.image_alt||a.title);
 if(storyVideo.dataset.clip!==a.clip){storyVideo.removeAttribute('src');storyVideo.load();storyPaused=reduced.matches;}
 storyVideo.dataset.clip=a.clip;storyVideoStatus.hidden=true;
 $('#story-clip-range').textContent=`高清片段 · ${a.clip_time} · 1080p`;
 syncStoryPlayback();
 $('#story-number').textContent=`${String(index+1).padStart(2,'0')} / ${a.title}`;$('#story-french').textContent=a.subtitle;
 $('#story-animal').src=`assets/animal-${a.actor}.webp?revision=20261022-animal-match`;$('#story-animal').alt=actors[a.actor];$('#story-speaker').textContent=a.speaker||`${actors[a.actor]}的旁白`;$('#story-voice').textContent=a.voice;
}
$$('.act-tabs button').forEach(b=>b.addEventListener('click',()=>setStory(Number(b.dataset.act))));
function tabKeys(list,select){
 list.forEach((b,i)=>b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%list.length;else if(e.key==='ArrowLeft')n=(i+list.length-1)%list.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=list.length-1;else return;e.preventDefault();select(list[n]);list[n].focus();}));
}
tabKeys($$('.act-tabs button'),b=>setStory(Number(b.dataset.act)));
const frameVideo=$('#frame-video'),frameVideoError=$('#frame-video-error');
const filmSource=video.querySelector('source').dataset.src;
let frameVisible=false,framePendingTime=0;
function seekFrameVideo(second){
 framePendingTime=second;
 if(frameVideo.readyState>=1){frameVideo.currentTime=Math.min(second,Math.max(0,frameVideo.duration-.05));framePendingTime=null;}
}
function syncFramePlayback(){
 if(!frameVisible||document.hidden||filmDialog.open||imageDialog.open){frameVideo.pause();return;}
 if(!frameVideo.getAttribute('src')){frameVideo.src=filmSource;frameVideo.load();}
 frameVideo.muted=true;frameVideo.defaultMuted=true;
 if(!reduced.matches)frameVideo.play().catch(()=>{});
}
frameVideo.addEventListener('loadedmetadata',()=>{if(framePendingTime!==null)seekFrameVideo(framePendingTime);});
frameVideo.addEventListener('error',()=>frameVideoError.hidden=false);
frameVideo.addEventListener('playing',()=>frameVideoError.hidden=true);
if('IntersectionObserver'in window){
 new IntersectionObserver(entries=>{frameVisible=entries[0].isIntersecting;syncFramePlayback();},{threshold:.1}).observe(frameVideo);
}else{frameVisible=true;}
document.addEventListener('visibilitychange',syncFramePlayback);
reduced.addEventListener('change',()=>{if(reduced.matches)frameVideo.pause();});
function filteredIndexes(){return frames.map((f,i)=>({f,i})).filter(x=>frameAct==='all'||String(x.f.act)===frameAct).map(x=>x.i);}
function showFrame(index,center=false,seek=true,second=null){
 if(!frames.length)return;frameIndex=index;const f=frames[index],ids=filteredIndexes(),at=ids.indexOf(index);
 if(seek){if(!frameVideo.getAttribute('src'))frameVideo.poster=f.image;seekFrameVideo(second===null?f.second:second);syncFramePlayback();}
 $('#frame-count').textContent=`${String(f.number).padStart(2,'0')} / 43`;$('#frame-time').textContent=f.time;$('#frame-title').textContent=f.title;$('#frame-description').textContent=f.description;$('#frame-voice').textContent=f.voice;
 $('#frame-animal').src=`assets/animal-${f.actor}.webp?revision=20261022-animal-match`;$('#frame-animal').alt=actors[f.actor];$('#frame-speaker').textContent=f.speaker||`${actors[f.actor]}的旁白`;
 $('#frame-zoom').setAttribute('aria-label',`放大播放：${f.title}`);
 $('#frame-prev').disabled=at<=0;$('#frame-next').disabled=at>=ids.length-1;
 $$('#filmstrip button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.index)===index)));
 if(center){const strip=$('#filmstrip'),b=strip.querySelector(`[data-index="${index}"]`);if(b)strip.scrollTo({left:b.offsetLeft-strip.offsetLeft-strip.clientWidth/2+b.offsetWidth/2,behavior:reduced.matches?'instant':'smooth'});}
}
function setFrameAct(act){
 frameAct=String(act);$$('.frame-tabs button').forEach(b=>{const selected=b.dataset.frameAct===frameAct;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
 $('#frame-panel').setAttribute('aria-labelledby',`frame-tab-${frameAct}`);
 const strip=$('#filmstrip');strip.replaceChildren();
 filteredIndexes().forEach(index=>{const f=frames[index],b=document.createElement('button');b.type='button';b.dataset.index=String(index);b.setAttribute('aria-label',`第${f.number}组 ${f.title} ${f.time}`);b.setAttribute('aria-pressed','false');
 const im=document.createElement('img');im.src=f.image;im.alt='';im.loading='lazy';im.width=136;im.height=77;const span=document.createElement('span');span.textContent=String(f.number).padStart(2,'0');const tm=document.createElement('small');tm.textContent=f.time;span.append(tm);b.append(im,span);b.addEventListener('click',()=>showFrame(index,true));strip.append(b);});
 const ids=filteredIndexes();if(ids.length)showFrame(ids[0],false,true,frameAct==='all'?0:acts[Number(frameAct)].start);strip.scrollLeft=0;
}
function moveFrame(direction){const ids=filteredIndexes(),i=ids.indexOf(frameIndex),next=ids[i+direction];if(next!==undefined)showFrame(next,true);}
$$('.frame-tabs button').forEach(b=>b.addEventListener('click',()=>setFrameAct(b.dataset.frameAct)));
tabKeys($$('.frame-tabs button'),b=>setFrameAct(b.dataset.frameAct));
$('#frame-prev').addEventListener('click',()=>moveFrame(-1));$('#frame-next').addEventListener('click',()=>moveFrame(1));
$('.frame-viewer').addEventListener('keydown',e=>{if(e.target.closest('video'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveFrame(e.key==='ArrowRight'?1:-1);}});
$('#frame-zoom').addEventListener('click',()=>openFilm(frameVideo.currentTime));
frameVideo.addEventListener('timeupdate',()=>{
 if(!frames.length||frameVideo.seeking||framePendingTime!==null)return;
 if(frameAct!=='all'){
  const act=acts[Number(frameAct)];
  if(frameVideo.currentTime>=Math.min(act.end,frameVideo.duration)-.05||frameVideo.currentTime<act.start-.2){seekFrameVideo(act.start);return;}
 }
 const ids=filteredIndexes();let current=ids[0];
 for(const index of ids){if(frames[index].second<=frameVideo.currentTime)current=index;else break;}
 if(current!==undefined&&current!==frameIndex)showFrame(current,false,false);
});
$('#story-frame-link').addEventListener('click',()=>{if(frames.length)setFrameAct(storyAct);else pendingAct=storyAct;});
Promise.all([Promise.resolve(window.SPRING_ATLAS_DATA.chapters),Promise.resolve(window.SPRING_ATLAS_DATA.frames)]).then(([chapters,data])=>{acts=chapters;frames=data;setStory(0);setFrameAct(pendingAct===null?'all':pendingAct);}).catch(()=>{$('.frame-error').hidden=false;$('#frame-prev').disabled=true;$('#frame-next').disabled=true;$('#frame-zoom').disabled=true;});

let roles=[],rolePairIndex=0;
function selectRolePair(index){
 if(!roles.length)return;
 const total=Math.ceil(roles.length/2);rolePairIndex=(index+total)%total;
 $('#role-position').textContent=`${String(rolePairIndex+1).padStart(2,'0')} / ${String(total).padStart(2,'0')} 组 · 两位一组 · 5s`;
 $$('.role-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===rolePairIndex));b.tabIndex=i===rolePairIndex?0:-1;});
 $('#role-panel').setAttribute('aria-labelledby',`role-tab-${rolePairIndex}`);
 $$('.role-entry').forEach((row,offset)=>{
  const at=rolePairIndex*2+offset,r=roles[at];row.hidden=!r;if(!r)return;
  changeImage(row.querySelector('[data-role-image]'),r.image,`${r.name}正面、侧面与背面的原角色三视图`);
  row.querySelector('[data-role-number]').textContent=`${String(at+1).padStart(2,'0')} / ${String(roles.length).padStart(2,'0')}`;
  row.querySelector('[data-role-name]').textContent=r.name;row.querySelector('[data-role-trait]').textContent=r.trait;row.querySelector('[data-role-description]').textContent=r.description;
  row.querySelector('[data-role-zoom]').setAttribute('aria-label',`放大${r.name}角色设定`);
 });
}
$$('.role-tabs button').forEach(b=>b.addEventListener('click',e=>{selectRolePair(Number(b.dataset.rolePair));if(e.detail>0)roleFocused=false;updateRolePlayback();}));
tabKeys($$('.role-tabs button'),b=>selectRolePair(Number(b.dataset.rolePair)));
$$('[data-role-zoom]').forEach((b,offset)=>b.addEventListener('click',()=>{const r=roles[rolePairIndex*2+offset];if(r)openImage(r.image,`${r.name} / 原角色三视图 / ${r.trait}`);}));
Promise.resolve(window.SPRING_ATLAS_DATA.roles).then(data=>{roles=data;selectRolePair(0);updateRolePlayback();}).catch(()=>{$('.role-error').hidden=false;$$('[data-role-zoom]').forEach(b=>b.disabled=true);});

let roleAuto=!reduced.matches,roleVisible=false,roleTimer=null,roleFocused=false;
const rolePlayback=$('#role-autoplay');
function updateRolePlayback(){
 if(roleTimer)clearInterval(roleTimer);roleTimer=null;
 rolePlayback.setAttribute('aria-pressed',String(roleAuto));rolePlayback.textContent=roleAuto?'暂停轮播':'开始轮播';
 if(roleAuto&&roleVisible&&roles.length&&!document.hidden){
  roleTimer=setInterval(()=>{if(!roleFocused&&!imageDialog.open&&!filmDialog.open)selectRolePair(rolePairIndex+1);},5000);
 }
}
rolePlayback.addEventListener('click',()=>{roleAuto=!roleAuto;updateRolePlayback();});
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{roleVisible=entries[0].isIntersecting;updateRolePlayback();},{threshold:.05}).observe($('#role-panel'));}
$('.role-tabs').addEventListener('focusin',e=>roleFocused=e.target.matches(':focus-visible'));$('.role-tabs').addEventListener('focusout',e=>{if(!$('.role-tabs').contains(e.relatedTarget))roleFocused=false;});
document.addEventListener('visibilitychange',updateRolePlayback);
reduced.addEventListener('change',()=>{if(reduced.matches){roleAuto=false;updateRolePlayback();}});
updateRolePlayback();
