'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const actors=['狐狸','狐狸','白马','黑熊','兔子','兔子','熊猫','黑熊'];
let voiceId=0;
$$('.voice').forEach(el=>{
  const actor=Number(el.dataset.actor),p=el.querySelector('p'),more=el.dataset.more;
  const button=document.createElement('button');button.className='voice-avatar';button.type='button';
  button.setAttribute('aria-label',`${actors[actor]}的旁白：展开设计解说`);button.setAttribute('aria-expanded','false');
  const avatar=document.createElement('img');avatar.src=`assets/animal-${actor}.webp?revision=20261009-spring-horse`;avatar.alt=actors[actor];avatar.loading='lazy';avatar.width=70;avatar.height=90;button.append(avatar);
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
function openImage(src,caption){$('#dialog-image').src=src;$('#dialog-image').alt=caption;$('#image-dialog-caption').textContent=caption;document.body.classList.add('dialog-open');imageDialog.showModal();}
$$('[data-image]').forEach(b=>b.addEventListener('click',()=>openImage(b.dataset.image,b.dataset.caption||b.parentElement.querySelector('img').alt)));
[imageDialog,filmDialog].forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(dialog===filmDialog)video.pause();});
});
$$('[data-open-film]').forEach(b=>b.addEventListener('click',()=>{document.body.classList.add('dialog-open');filmDialog.showModal();video.play().catch(()=>{});}));
video.addEventListener('error',()=>$('.video-error').hidden=false);
let acts=[];
let storyAct=0,frames=[],frameIndex=0,frameAct='all',pendingAct=null;
function changeImage(img,src,alt){
 img.alt=alt;img.classList.add('is-changing');img.src=src;
 const show=()=>{if(img.getAttribute('src')===src)img.classList.remove('is-changing');};
 if(img.decode)img.decode().then(show,show);else{img.onload=show;img.onerror=show;}
}
function setStory(index){
 const a=acts[index];if(!a)return;storyAct=index;
 $$('.act-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
 $('#story-panel').setAttribute('aria-labelledby',`story-tab-${index}`);
 changeImage($('#story-image'),a.image,a.image_alt||`${a.title}：${a.voice}`);
 $('#story-number').textContent=`${String(index+1).padStart(2,'0')} / ${a.title}`;$('#story-french').textContent=a.subtitle;
 $('#story-animal').src=`assets/animal-${a.actor}.webp?revision=20261009-spring-horse`;$('#story-animal').alt=actors[a.actor];$('#story-speaker').textContent=`${actors[a.actor]}的旁白`;$('#story-voice').textContent=a.voice;
}
$$('.act-tabs button').forEach(b=>b.addEventListener('click',()=>setStory(Number(b.dataset.act))));
function tabKeys(list,select){
 list.forEach((b,i)=>b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%list.length;else if(e.key==='ArrowLeft')n=(i+list.length-1)%list.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=list.length-1;else return;e.preventDefault();select(list[n]);list[n].focus();}));
}
tabKeys($$('.act-tabs button'),b=>setStory(Number(b.dataset.act)));
function filteredIndexes(){return frames.map((f,i)=>({f,i})).filter(x=>frameAct==='all'||String(x.f.act)===frameAct).map(x=>x.i);}
function showFrame(index,center=false){
 if(!frames.length)return;frameIndex=index;const f=frames[index],ids=filteredIndexes(),at=ids.indexOf(index);
 changeImage($('#frame-image'),f.image,`${String(f.number).padStart(2,'0')} / ${f.title} / ${f.time}`);
 $('#frame-count').textContent=`${String(f.number).padStart(2,'0')} / 43`;$('#frame-time').textContent=f.time;$('#frame-title').textContent=f.title;$('#frame-description').textContent=f.description;$('#frame-voice').textContent=f.voice;
 $('#frame-animal').src=`assets/animal-${f.actor}.webp?revision=20261009-spring-horse`;$('#frame-animal').alt=actors[f.actor];$('#frame-speaker').textContent=`${actors[f.actor]}的旁白`;
 $('#frame-zoom').setAttribute('aria-label',`放大第${f.number}组关键画面：${f.title}`);
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
 const ids=filteredIndexes();if(ids.length)showFrame(ids[0]);strip.scrollLeft=0;
}
function moveFrame(direction){const ids=filteredIndexes(),i=ids.indexOf(frameIndex),next=ids[i+direction];if(next!==undefined)showFrame(next,true);}
$$('.frame-tabs button').forEach(b=>b.addEventListener('click',()=>setFrameAct(b.dataset.frameAct)));
tabKeys($$('.frame-tabs button'),b=>setFrameAct(b.dataset.frameAct));
$('#frame-prev').addEventListener('click',()=>moveFrame(-1));$('#frame-next').addEventListener('click',()=>moveFrame(1));
$('.frame-viewer').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveFrame(e.key==='ArrowRight'?1:-1);}});
$('#frame-zoom').addEventListener('click',()=>{const f=frames[frameIndex];if(f)openImage(f.image,`${String(f.number).padStart(2,'0')} / ${f.title} / ${f.time}`);});
$('#story-frame-link').addEventListener('click',()=>{if(frames.length)setFrameAct(storyAct);else pendingAct=storyAct;});
Promise.all([Promise.resolve(window.SPRING_ATLAS_DATA.chapters),Promise.resolve(window.SPRING_ATLAS_DATA.frames)]).then(([chapters,data])=>{acts=chapters;frames=data;setStory(0);setFrameAct(pendingAct===null?'all':pendingAct);}).catch(()=>{$('.frame-error').hidden=false;$('#frame-prev').disabled=true;$('#frame-next').disabled=true;$('#frame-zoom').disabled=true;});

let roles=[],roleIndex=0;
function selectRole(index){
 if(!roles.length)return;roleIndex=index;const r=roles[index];
 $('#role-position').textContent=`${String(index+1).padStart(2,'0')} / 10 · 5s`;
 $$('.role-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
 $('#role-panel').setAttribute('aria-labelledby',`role-tab-${index}`);
 changeImage($('#role-image'),r.image,`${r.name}正面、侧面与背面的原角色三视图`);
 $('#role-name').textContent=r.name;$('#role-trait').textContent=r.trait;$('#role-description').textContent=r.description;
 $('#role-zoom').setAttribute('aria-label',`放大${r.name}角色设定`);
}
$$('.role-tabs button').forEach(b=>b.addEventListener('click',e=>{selectRole(Number(b.dataset.role));if(e.detail>0)roleFocused=false;updateRolePlayback();}));
tabKeys($$('.role-tabs button'),b=>selectRole(Number(b.dataset.role)));
$('#role-zoom').addEventListener('click',()=>{const r=roles[roleIndex];if(r)openImage(r.image,`${r.name} / 原角色三视图 / ${r.trait}`);});
Promise.resolve(window.SPRING_ATLAS_DATA.roles).then(data=>{roles=data;selectRole(0);updateRolePlayback();}).catch(()=>{$('.role-error').hidden=false;$('#role-zoom').disabled=true;});

let roleAuto=!reduced.matches,roleVisible=false,roleTimer=null,roleHovered=false,roleFocused=false;
const rolePlayback=$('#role-autoplay');
function updateRolePlayback(){
 if(roleTimer)clearInterval(roleTimer);roleTimer=null;
 rolePlayback.setAttribute('aria-pressed',String(roleAuto));rolePlayback.textContent=roleAuto?'暂停轮播':'开始轮播';
 if(roleAuto&&roleVisible&&roles.length&&!document.hidden){
  roleTimer=setInterval(()=>{if(!roleHovered&&!roleFocused&&!imageDialog.open&&!filmDialog.open)selectRole((roleIndex+1)%roles.length);},5000);
 }
}
rolePlayback.addEventListener('click',()=>{roleAuto=!roleAuto;updateRolePlayback();});
if('IntersectionObserver'in window){new IntersectionObserver(entries=>{roleVisible=entries[0].isIntersecting;updateRolePlayback();},{threshold:.15}).observe($('.role-stage'));}
if(window.matchMedia('(hover:hover)').matches){$('.role-stage').addEventListener('mouseenter',()=>roleHovered=true);$('.role-stage').addEventListener('mouseleave',()=>roleHovered=false);}
$('.role-tabs').addEventListener('focusin',()=>roleFocused=true);$('.role-tabs').addEventListener('focusout',e=>{if(!$('.role-tabs').contains(e.relatedTarget))roleFocused=false;});
document.addEventListener('visibilitychange',updateRolePlayback);
reduced.addEventListener('change',()=>{if(reduced.matches){roleAuto=false;updateRolePlayback();}});
updateRolePlayback();
