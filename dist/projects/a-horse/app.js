document.documentElement.classList.add('js');
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=$('.menu-toggle');menu.addEventListener('click',()=>{const open=$('.site-header nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'收起项目导航':'展开项目导航');});
$$('.site-header nav a').forEach(a=>a.addEventListener('click',()=>{$('.site-header nav').classList.remove('open');menu.setAttribute('aria-expanded','false');}));
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');reveals.unobserve(e.target);}}),{threshold:.12});$$('.reveal').forEach(el=>reveals.observe(el));
let scrollQueued=false;function onScroll(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{const y=window.scrollY;$('.site-header').classList.toggle('scrolled',y>60);$('.scroll-progress').style.transform=`scaleX(${y/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;scrollQueued=false;});}addEventListener('scroll',onScroll,{passive:true});onScroll();
const navSpy=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('.site-header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}),{rootMargin:'-15% 0px -65% 0px'});$$('main>section[id]').forEach(el=>navSpy.observe(el));
let lastTrigger;function openDialog(d,trigger){lastTrigger=trigger||document.activeElement;hero.pause();if(typeof ca!=='undefined'){ca.pause();cb.pause();compareWanted=false;compareVisual();}d.showModal();document.body.classList.add('modal-open');}function closeDialog(d){d.close();}
$$('dialog').forEach(d=>{$('.dialog-close',d).addEventListener('click',()=>closeDialog(d));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}});d.addEventListener('close',()=>{$$('video',d).forEach(v=>v.pause());document.body.classList.remove('modal-open');lastTrigger?.focus({preventScroll:true});});});
const film=$('#film-player');let filmVersion='captioned',pendingSeek=0;function filmSource(){film.src=`assets/video/film-${filmVersion}.mp4`;film.load();}film.addEventListener('loadedmetadata',()=>{film.currentTime=Math.min(pendingSeek,film.duration||35.3);if($('#film-dialog').open)film.play().catch(()=>{});});film.addEventListener('error',()=>{$('.media-error').hidden=false;});
function openFilm(time=0,trigger){pendingSeek=Number(time);$('.media-error').hidden=true;if(!film.src)filmSource();else{film.currentTime=pendingSeek;film.play().catch(()=>{});}openDialog($('#film-dialog'),trigger);}
$$('[data-film]').forEach(b=>b.addEventListener('click',()=>openFilm(b.dataset.film,b)));
$$('[data-seek]').forEach(b=>b.addEventListener('click',()=>{pendingSeek=Number(b.dataset.seek);film.currentTime=pendingSeek;film.play().catch(()=>{});}));
$$('[data-version]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.version===filmVersion)return;pendingSeek=film.currentTime||0;filmVersion=b.dataset.version;$$('[data-version]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('.media-error').hidden=true;filmSource();}));
const hero=$('#hero-video');let ambientPaused=true;const motion=$('.motion-toggle');function updateMotion(){document.body.classList.toggle('motion-paused',ambientPaused);motion.textContent=ambientPaused?'播放动态':'暂停动态';motion.setAttribute('aria-pressed',String(ambientPaused));if(ambientPaused){hero.pause();hero.classList.remove('ready');}else{if(!hero.src){hero.src=hero.dataset.ambient;hero.load();}hero.play().catch(()=>{ambientPaused=true;updateMotion();});}}hero.addEventListener('playing',()=>hero.classList.add('ready'));motion.addEventListener('click',()=>{ambientPaused=!ambientPaused;updateMotion();});
new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!ambientPaused)updateMotion();else hero.pause();}),{threshold:.05}).observe(hero);document.addEventListener('visibilitychange',()=>{if(document.hidden)hero.pause();else if(!ambientPaused&&window.scrollY<innerHeight)updateMotion();});if(ambientPaused)updateMotion();
// Short image notes are paired with actual frames; long analysis stays in details.
const shotNotes=[
  [
    "闭目 · 集中人物注意",
    "直视 · 建立人物识别"
  ],
  [
    "马鬃 · 提出主题愿望",
    "圆形金光 · 视觉过渡"
  ],
  [
    "蹄部迈步 · 交代局部动作",
    "抚马 · 建立人马关系"
  ],
  [
    "扬尘 · 回应奔腾",
    "白衣骑乘 · 回应飞扬"
  ],
  [
    "玻璃破碎 · 回应勇敢",
    "黑衣红披风 · 气势转折"
  ],
  [
    "大漠远景 · 回应热烈",
    "侧面骑乘 · 转入不管"
  ],
  [
    "火蝶 · 展开旅途想象",
    "人物背影 · 回到出发宣言"
  ],
  [
    "骑乘局部 · 收束动作",
    "日期与新身份 · 留下期待"
  ],
  [
    "眼眸倒影 · 改变观看尺度",
    "正脸 · 踏上新征程"
  ],
  [
    "人马并肩 · 回应前段关系",
    "稳定肖像 · 完成落版"
  ]
];
const annotationToggle=$('.annotation-toggle');
annotationToggle.addEventListener('click',()=>{const off=document.body.classList.toggle('annotations-off');annotationToggle.setAttribute('aria-pressed',String(!off));annotationToggle.textContent=off?'显示图上注释':'隐藏图上注释';});

// A change of shot updates images, reasoning and the exact film-entry time together.

const shotEnglish = ['A small gesture draws the eye.', 'Strength meets a trace of light.', 'A connection before the journey.', 'The wish becomes movement.', 'Courage becomes a visible event.', 'Movement opens into a wider world.', 'A resolve held against the unknown.', 'A date, a promise, a new identity.', 'The world returns to the gaze.', 'A quiet portrait remains.'];
let currentShot=0;
function activateShot(index,focus=false){
  currentShot=Math.max(0,Math.min(PROJECT_SHOTS.length-1,index));const s=PROJECT_SHOTS[currentShot];
  $$('.shot-tabs [data-shot]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===currentShot));b.tabIndex=i===currentShot?0:-1;if(i===currentShot&&focus){b.focus();b.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced.matches?'auto':'smooth'});}});
  $('#shot-panel').setAttribute('aria-labelledby',`shot-tab-${currentShot+1}`);
  $('#shot-english').textContent=shotEnglish[currentShot];$('#shot-time').textContent=`CUT ${s.id} / ${s.time}`;$('#shot-title').textContent=s.title;$('#shot-description').textContent=s.description;$('#shot-purpose').textContent=s.purpose;$('#shot-motion').textContent=s.motion;$('#shot-delta').textContent=s.delta;
  [s.startFrame,s.endFrame].forEach((src,i)=>{const img=i?$('#shot-end'):$('#shot-start');img.src=src;img.alt=`分镜${s.id}：${s.title}，${i?'落幅':'起幅'}`;const b=img.closest('button');b.dataset.image=src;b.dataset.caption=`${s.id} / ${s.title} / ${i?'落幅':'起幅'}`;});
  ['#shot-start-note','#shot-end-note'].forEach((id,i)=>{$('.note-text',$(id)).textContent=shotNotes[currentShot][i];});
  $('#shot-play').dataset.film=String(s.seek);$('#shot-count').textContent=`${s.id} / 10`;$('#shot-prev').disabled=currentShot===0;$('#shot-next').disabled=currentShot===9;
  $('#announcement').textContent=`已切换至分镜${s.id}，${s.title}`;
}
$$('[data-shot]').forEach(b=>b.addEventListener('click',()=>activateShot(Number(b.dataset.shot))));$('#shot-prev').addEventListener('click',()=>activateShot(currentShot-1));$('#shot-next').addEventListener('click',()=>activateShot(currentShot+1));
function tabKeys(list,buttons,callback){list.addEventListener('keydown',e=>{const index=buttons.indexOf(document.activeElement);if(index<0)return;let next=index;if(e.key==='ArrowRight')next=(index+1)%buttons.length;else if(e.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=buttons.length-1;else return;e.preventDefault();callback(next,true);});}
tabKeys($('.shot-tabs'),$$('[data-shot]'),activateShot);
const outline=$('#shot-outline-content');PROJECT_SHOTS.forEach(s=>{const article=document.createElement('article'),head=document.createElement('div'),copy=document.createElement('div'),h=document.createElement('h3'),time=document.createElement('p');h.textContent=`${s.id} / ${s.title}`;time.className='micro';time.textContent=s.time;head.append(h,time);for(const [label,value] of [['画面设计',s.description],['叙事作用',s.purpose],['镜头调度',s.motion],['执行取舍',s.delta]]){const p=document.createElement('p');p.textContent=label+'：'+value;copy.append(p);}article.append(head,copy);outline.append(article);});

// Full-size frames remain one click away, including dynamically changed storyboard frames.
$$('[data-image]').forEach(b=>b.addEventListener('click',()=>{const d=$('#image-dialog');$('img',d).src=b.dataset.image;$('img',d).alt=b.dataset.caption;$('.image-caption',d).textContent=b.dataset.caption;openDialog(d,b);}));

const transformFrames=[['assets/transform-before-native.webp','01 / 白衣骑乘 · 设计关键帧'],['assets/transform-cross-native.webp','02 / 玻璃破界 · 设计关键帧'],['assets/transform-after-native.webp','03 / 黑衣与红披风 · 设计关键帧']];
const transformNotes=['白衣骑乘 · 破碎之前的状态','玻璃与碎片 · 可见的破界动作','黑衣与红披风 · 回应勇敢的气势'];
function setSharpImage(img,native){if(native.includes('-native.webp')){const display=native.replace('-native','-display');img.srcset=display+' 1920w, '+native+' 3072w';img.sizes='(max-width:760px) calc(100vw - 36px), 860px';img.src=display;}else{img.removeAttribute('srcset');img.src=native;}}
function transformState(index){const [src,caption]=transformFrames[index];setSharpImage($('#transform-image'),src);$('#transform-image').alt=caption;$('#transform-caption').textContent=caption;$('.note-text',$('#transform-note')).textContent=transformNotes[index];$('small',$('#transform-note')).textContent='STATE 0'+(index+1);$('#transform-range').value=index;$$('[data-transform]').forEach((b,i)=>{b.classList.toggle('selected',index===i);b.setAttribute('aria-pressed',String(index===i));});}
$$('[data-transform]').forEach(b=>b.addEventListener('click',()=>transformState(Number(b.dataset.transform))));$('#transform-range').addEventListener('input',e=>transformState(Number(e.target.value)));
$('#hook-range').addEventListener('input',e=>$('.compare-images').style.setProperty('--split',e.target.value+'%'));
$('.eye-hotspot').addEventListener('click',e=>{const b=e.currentTarget,open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#eye-detail').hidden=!open;$('span[aria-hidden]',b).textContent=open?'−':'+';});

const paletteNotes=['红披风 · 延续同一情绪基调','琥珀碎片 · 集中转折的亮度','暗色轮廓 · 收拢视觉重量','白衣 · 建立轻盈出发状态','海浪青蓝 · 让阻力获得冷色层次'];
const palette=[
 {hex:'DEEP RED / #821C1B',title:'连接宣言与人物气场',description:'深红环境与红披风连接不同段落，让造型变化保持同一情绪基调。',image:'assets/cape-back-native.webp',caption:'DEEP RED / MOMENTUM'},
 {hex:'AMBER GOLD / #E88531',title:'让转折成为亮度的高点',description:'圆环与琥珀碎片形成集中高亮，衬托跨越的瞬间；人物轮廓需要在密集特效中保持清晰。',image:'assets/riding-break-native.webp',caption:'AMBER GOLD / THE TURNING POINT'},
 {hex:'DEEP BLACK / #100E0D',title:'收拢重量，稳定主体',description:'黑马与黑色西装承接视觉重量。深色轮廓让肤色、珠宝与红披风的差异更加明确。',image:'assets/portrait-native.webp',caption:'DEEP BLACK / PRESENCE'},
 {hex:'IVORY WHITE / #EDE6D7',title:'建立轻盈的出发状态',description:'白衣与白蝶构成前段的轻盈元素；进入黑衣红披风之后，造型重量的变化变得可感知。',image:'assets/riding-white-native.webp',caption:'IVORY WHITE / THE BEGINNING'},
 {hex:'SEA BLUE / #6A8991',title:'短暂打断持续的暖色',description:'青蓝与白色海浪带来冷色变化，以不同的亮度、运动与环境尺度表现前路阻力。',image:'assets/sea-native.webp',caption:'SEA BLUE / RESISTANCE'}
];
$$('[data-palette]').forEach(b=>b.addEventListener('click',()=>{const p=palette[Number(b.dataset.palette)];$('#palette-hex').textContent=p.hex;$('#palette-title').textContent=p.title;$('#palette-description').textContent=p.description;$('#palette-english').textContent=['A colour that carries momentum.','Light concentrates at the turning point.','A composed presence within the dark.','Lightness at the beginning.','A cooler rhythm enters the journey.'][Number(b.dataset.palette)];setSharpImage($('#palette-image'),p.image);$('#palette-image').alt=p.title;$('#palette-caption').textContent=p.caption+' / DESIGN KEYFRAME';$('.note-text',$('#palette-note')).textContent=paletteNotes[Number(b.dataset.palette)];$$('[data-palette]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});}));

// Compare actual candidate files with one normalized time control.
const comparisons=[
 {a:'v03',b:'v06',nameA:'11.mp4',nameB:'Video-1774091183515.mp4',title:'变装候选：空间与动作的衔接',copy:'比较人马进入玻璃平面的位置、破碎时机与造型切换。核心取舍是让突破动作清晰，同时控制碎片对面部和马体的遮挡。'},
 {a:'v53',b:'v54',nameA:'Video-1774099921482.mp4',nameB:'Video-1774099933209.mp4',title:'肖像候选：人物与光影的稳定',copy:'比较面部识别、扫光强弱与人马接触关系。保留细微情绪动作，同时控制面部漂移和光影对识别的干扰。'}
];
const ca=$('#candidate-a'),cb=$('#candidate-b'),compareButton=$('#compare-play');let comparisonIndex=0,compareWanted=false,comparePosition=0;
function compareVisual(){compareButton.textContent=compareWanted?'暂停候选播放':'同时播放候选';compareButton.setAttribute('aria-pressed',String(compareWanted));}
function comparisonSwitch(index,focus=false){compareWanted=false;ca.pause();cb.pause();comparisonIndex=index;comparePosition=0;const c=comparisons[index];[ca,cb].forEach((v,i)=>{v.removeAttribute('src');v.load();v.poster=`assets/${i?c.b:c.a}.webp`;});$('#candidate-a-name').textContent=c.nameA;$('#candidate-b-name').textContent=c.nameB;$('#candidate-analysis-title').textContent=c.title;$('#candidate-analysis-copy').textContent=c.copy;$('#candidate-english').textContent=index?'A recognisable face through changing light.':'Clarity within a moment of transformation.';const notes=index?['人物姿态 · 留意面部与接触关系','扫光强弱 · 留意人物识别的稳定性']:['空间进入 · 留意人物与圆环的位置','状态切换 · 留意碎片与主体的关系'];['#candidate-a-note','#candidate-b-note'].forEach((id,i)=>{$('.note-text',$(id)).textContent=notes[i];});$('#compare-range').value=0;$('#compare-clock').textContent='00:00';compareVisual();$$('[data-comparison]').forEach((b,i)=>{b.setAttribute('aria-selected',String(index===i));b.tabIndex=index===i?0:-1;if(focus&&index===i)b.focus();});$('#candidate-panel').setAttribute('aria-labelledby','compare-tab-'+index);}
function ensureCompareSources(){const c=comparisons[comparisonIndex];[ca,cb].forEach((v,i)=>{if(!v.getAttribute('src')){v.src=`assets/video/${i?c.b:c.a}.mp4`;v.load();}});}
function playCandidates(){ensureCompareSources();return Promise.all([ca.play(),cb.play()]).then(()=>{compareWanted=true;compareVisual();}).catch(()=>{ca.pause();cb.pause();compareWanted=false;compareVisual();$('#announcement').textContent='候选片段暂时无法播放，请重新点击播放。';});}
compareButton.addEventListener('click',()=>{if(compareWanted){compareWanted=false;ca.pause();cb.pause();compareVisual();}else playCandidates();});
$$('[data-comparison]').forEach(b=>b.addEventListener('click',()=>comparisonSwitch(Number(b.dataset.comparison))));tabKeys($('.process-tabs'),$$('[data-comparison]'),comparisonSwitch);
$('#compare-range').addEventListener('input',e=>{comparePosition=Number(e.target.value)/100;ensureCompareSources();[ca,cb].forEach(v=>{if(Number.isFinite(v.duration))v.currentTime=comparePosition*v.duration;});});
[ca,cb].forEach(v=>v.addEventListener('loadedmetadata',()=>{v.currentTime=comparePosition*v.duration;}));
ca.addEventListener('timeupdate',()=>{if(!Number.isFinite(ca.duration))return;$('#compare-range').value=(ca.currentTime/ca.duration)*100;$('#compare-clock').textContent='00:'+Math.floor(ca.currentTime).toString().padStart(2,'0');if(compareWanted&&Number.isFinite(cb.duration)&&Math.abs(cb.currentTime/ cb.duration-ca.currentTime/ca.duration)>.07)cb.currentTime=ca.currentTime/ca.duration*cb.duration;});
new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&compareWanted){compareWanted=false;ca.pause();cb.pause();compareVisual();}}),{threshold:.01}).observe($('#candidate-panel'));

// All 56 distinct candidates remain available, with only visible posters loaded.
let library=[],libraryVisible=8;
function libraryFiltered(){const category=$('#library-category').value;return library.filter(x=>category==='全部镜头'||x.category===category);}
function renderLibrary(){const records=libraryFiltered(),shown=records.slice(0,libraryVisible),grid=$('#library-grid');grid.replaceChildren();for(const r of shown){const article=document.createElement('article');article.className='library-card';const b=document.createElement('button');b.setAttribute('aria-label',`播放${r.category}素材 ${r.id}，${r.duration.toFixed(2)}秒`);b.title=r.name;const thumb=document.createElement('div');thumb.className='library-thumbnail';const img=document.createElement('img');img.src=r.poster;img.alt=r.category+'素材 '+r.id;img.loading='lazy';img.width=r.width||1080;img.height=r.height||1920;const play=document.createElement('span');play.setAttribute('aria-hidden','true');play.innerHTML='<i class="play-symbol"></i>';thumb.append(img,play);const caption=document.createElement('div');caption.className='library-caption';const cat=document.createElement('span'),time=document.createElement('span');cat.textContent=r.id+' / '+r.category;time.textContent=r.duration.toFixed(2)+' S';caption.append(cat,time);const h=document.createElement('h3');h.textContent=r.name;b.append(thumb,caption,h);b.addEventListener('click',()=>openAsset(r,b));article.append(b);grid.append(article);}$('#library-count').textContent=`${$('#library-category').value} · 已显示 ${shown.length} / ${records.length} 个镜头`;$('#library-more').hidden=shown.length>=records.length;$('#library-more').textContent=`加载更多镜头（剩余 ${records.length-shown.length} 个）`;}
function openAsset(r,trigger){const d=$('#asset-dialog'),v=$('video',d);v.poster=r.poster;v.src=r.video;v.load();$('#asset-title').textContent=`${r.id} / ${r.category}`;$('.asset-category',d).textContent=r.category.toUpperCase()+' / CANDIDATE';$('.asset-name',d).textContent=r.name;$('.asset-description',d).textContent='制作过程中的候选镜头。可对照成片，比较人物稳定性、运动关系、光影层次与字幕空间。';$('.asset-meta',d).textContent=`${r.duration.toFixed(2)}秒 · ${r.audio?'保留素材音轨':'素材无音轨'}${r.duplicates>1?' · 同内容文件 '+r.duplicates+' 份':''}`;openDialog(d,trigger);v.play().catch(()=>{});}
$('#library-category').addEventListener('change',()=>{libraryVisible=8;renderLibrary();});$('#library-more').addEventListener('click',()=>{libraryVisible+=12;renderLibrary();});
if(typeof PROJECT_LIBRARY!=='undefined'){library=PROJECT_LIBRARY;renderLibrary();}else{$('#library-count').textContent='素材清单未加载';$('#library-error').hidden=false;}

// Suspend moving media while viewing a still, opening another clip or leaving the page.
$$('dialog').forEach(d=>d.addEventListener('toggle',e=>{if(e.newState==='open'){hero.pause();ca.pause();cb.pause();compareWanted=false;compareVisual();}else if(!ambientPaused&&window.scrollY<innerHeight)updateMotion();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){film.pause();ca.pause();cb.pause();compareWanted=false;compareVisual();$$('dialog video').forEach(v=>v.pause());}});
