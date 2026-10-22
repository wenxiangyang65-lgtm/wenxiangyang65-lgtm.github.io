const A='assets/';
const acts=[
 {name:'乱象与独行',start:0,clip:'film.mp4?v=20261010-all-film-hd',previewStart:0,previewDuration:23,color:'#9eafbd',intro:'风沙、巨狮与绝壁逐层加压。以人物与环境的尺度对比，建立逆境守道的侠客身份。',main:[81,'黄沙至风雪',0,'从黄沙独行、逆风披袍，到冰川巨狮与绝壁攀登，完整展现第一幕的环境变化。'],frames:[[83,'逆风披袍',5,'斗笠与黑袍成为贯穿全片的人物锚点。'],[84,'巨狮压境',11.7,'巨物构图与冰川冷调，让一人的坚持有了可被感知的重量。'],[93,'风雪凝神',14,'克制的人物神态，回应逆风守道。'],[85,'绝壁攀登',17,'以垂直落差表现坚持所付出的代价。']]},
 {name:'淬炼与铸心',clip:'film.mp4?v=20261010-all-film-hd',previewStart:34.4,previewDuration:2.8,start:23,color:'#d66a3c',intro:'从熔炼、浇铸到锤击、淬火，让长期坚持成为有温度、有重量的物理过程。',main:[59,'入水淬火',35.3,'冰火相激，黑壳剥落，透出内里的金色。以材质变化讲述去伪存真。'],frames:[[61,'熔铁入模',26.4,'用流动的铁水完成神兵的重塑。'],[62,'赤诚熔炼',24.7,'原石经火淬炼，初心成为叙事中的唯一热源。'],[63,'锤击成刃',33.2,'锻造动作与放射火花，为坚持赋予冲击力。'],[41,'亲手铸剑',32,'匠人的动作，让抽象信念成为切实的劳动。']]},
 {name:'立则与聚心',clip:'film.mp4?v=20261010-all-film-hd',previewStart:48.2,previewDuration:4.8,start:38,color:'#c1a06e',intro:'以“择、质、价”立则，完成价值聚心。人物、熔火图腾与剑身铭文共同完成从个体到集体的升华。',main:[73,'人剑立于图腾',50.9,'主角位于图腾中心，岩浆沿阵纹蔓延，镜头拉升为众心聚力。'],frames:[[78,'剑冢立阵',39.8,'石狮环伺、万剑列阵，建立庄重的仪式空间。'],[79,'人物走入',41,'人物进入阵心，叙事由行走转向激活。'],[65,'人物定势',42.8,'高潮前保留一个静场，积蓄情绪。'],[66,'择 · 选择',45.3,'择，以选择立则。'],[67,'质 · 品质',45.8,'质，以品质为内核。'],[68,'价 · 价值',46.3,'价，以价值完成聚心。']]},
 {name:'万剑与亮剑',clip:'film.mp4?v=20261010-all-film-hd',previewStart:68,previewDuration:3.4,start:55.5,color:'#e8c58e',intro:'擎天巨剑破土，万剑响应。从一人持剑到众心成锋，最终以人狮合一的画面收束品牌宣言。',main:[72,'万剑归宗',68.8,'巨剑为中心、万剑形成风暴，把个体的坚持升华为集体的力量。'],frames:[[74,'激活神剑',53.3,'545818 与青铜回纹一同铸入剑身。'],[75,'巨剑破土',58,'尺度瞬间放大，叙事进入史诗高潮。'],[69,'人物登顶',66.3,'以仰视构图与纵向落差强化人物气势。'],[76,'万剑响应',62.3,'飞剑由四方汇聚，形成众心的视觉隐喻。'],[77,'亮剑终章',75.8,'半脸半狮，完成人物、品牌与信息的共同收束。']]}
];
let actIndex=0, galleryItems=[], galleryIndex=0, motionEnabled=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const time=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(1).padStart(4,'0')}`;
function frameMarkup(f,idx,featured=false,act=0){return `<button class="frame-card" data-gallery="${idx}" data-gallery-act="${act}" aria-label="查看高清：${f[1]}"><div class="frame-media"><img src="${A}p${f[0]}.webp" srcset="${A}p${f[0]}.webp 1x, ${A}p${f[0]}-hd.webp 2x" alt="${f[1]}" loading="lazy" width="900" height="1600">${featured?`<video class="act-loop" data-start="${acts[act].previewStart||0}" data-end="${(acts[act].previewStart||0)+(acts[act].previewDuration||6)}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-src="${A}${acts[act].clip||`act-${act+1}.mp4`}"></video>`:''}<span class="frame-overlay">查看高清画面 ＋</span></div><div class="frame-meta"><span>${time(f[2])}</span><span>${f[1]}</span></div></button>`}
function setActiveAct(i){
 actIndex=i;$('.story').style.setProperty('--accent',acts[i].color);
 $$('[data-act]').forEach((button,index)=>{if(index===i)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
}
function renderActs(){
 $('#act-panel').innerHTML=acts.map((act,i)=>`<article id="story-act-${i}" class="story-act" data-story-act="${i}" aria-labelledby="story-act-title-${i}" style="--accent:${act.color}"><div class="act-original-heading"><p class="act-label"><img src="${A}titles/act${i+1}-label-original.webp" alt="第${['一','二','三','四'][i]}幕" width="580" height="${[172,180,168,176][i]}" loading="lazy"></p><h3 id="story-act-title-${i}" class="art-heading"><img src="${A}titles/act${i+1}-clean.webp" alt="${act.name}" width="${i===0?1200:2020}" height="${[157,264,268,268][i]}" loading="lazy"></h3></div><div class="act-intro"><p>${act.intro}</p><button class="primary" data-film="${act.start}"><span class="play-small">▶</span> 观看第${['一','二','三','四'][i]}幕</button></div><div class="frame-grid"><div class="feature-frame">${frameMarkup(act.main,0,true,i)}<div class="stage-controls"><span>${act.previewDuration?`${act.previewDuration} 秒 · ${act.main[1]}`:'6 秒动态片段'}</span><button class="motion-switch" aria-pressed="${motionEnabled}">动态预览</button></div></div><div class="support-frames">${act.frames.map((f,j)=>frameMarkup(f,j+1,false,i)).join('')}</div></div></article>`).join('');
 $$('.act-loop').forEach(v=>{
  v.addEventListener('loadedmetadata',()=>{v.currentTime=Number(v.dataset.start);});
  v.addEventListener('timeupdate',()=>{if(!v.seeking&&(v.currentTime>=Number(v.dataset.end)-.06||v.currentTime<Number(v.dataset.start)-.1))v.currentTime=Number(v.dataset.start);});
 });
 galleryItems=[acts[0].main,...acts[0].frames];setActiveAct(0);observeStage();
}
const stageVisible=new Set();let stageObserver;
function pauseActVideos(){$$('.act-loop').forEach(v=>v.pause());}
function syncActVideos(){
 $$('.motion-switch').forEach(button=>button.setAttribute('aria-pressed',String(motionEnabled)));
 $$('.act-loop').forEach(v=>{
  if(!stageVisible.has(v)||!motionEnabled||document.hidden||document.querySelector('dialog[open]')){v.pause();v.parentElement.classList.remove('motion-visible');return;}
  if(!v.getAttribute('src')){v.src=v.dataset.src;v.load();}
  v.muted=true;v.play().then(()=>{if(!v.paused)v.parentElement.classList.add('motion-visible');}).catch(()=>{});
 });
}
function observeStage(){
 if(!stageObserver){
  stageObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{const v=e.target;if(e.isIntersecting)stageVisible.add(v);else stageVisible.delete(v);});syncActVideos();},{threshold:.15});
  $$('.act-loop').forEach(video=>stageObserver.observe(video));
 }
 syncActVideos();
}
function actScrollOffset(){return $('.site-header').getBoundingClientRect().height+$('.act-tabs').getBoundingClientRect().height+24;}
function jumpToAct(i){
 const panel=$(`#story-act-${i}`);if(!panel)return;
 window.scrollTo({top:scrollY+panel.getBoundingClientRect().top-actScrollOffset(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
let storyScrollQueued=false;
function syncStoryChapter(){
 storyScrollQueued=false;if(document.querySelector('dialog[open]'))return;
 const panels=$$('.story-act'),offset=actScrollOffset();
 const lead=Math.min(Math.max(32,(innerHeight-offset)*.28),Math.min(...panels.map(panel=>panel.getBoundingClientRect().height))*.8);
 const line=offset+lead;let active=0;
 panels.forEach((panel,i)=>{if(panel.getBoundingClientRect().top<=line)active=i;});
 if(scrollY+innerHeight>=document.documentElement.scrollHeight-16)active=acts.length-1;
 if(active!==actIndex)setActiveAct(active);
}
function queueStoryChapter(){if(!storyScrollQueued){storyScrollQueued=true;requestAnimationFrame(syncStoryChapter);}}
window.addEventListener('scroll',queueStoryChapter,{passive:true});
window.addEventListener('resize',queueStoryChapter);
window.addEventListener('pageshow',queueStoryChapter);
function showGallery(items,index){pauseActVideos();pauseConceptVideos();pauseColorVideo();galleryItems=items;galleryIndex=index;updateGallery();$('#gallery-dialog').showModal();document.body.classList.add('dialog-open');}
function updateGallery(){const f=galleryItems[galleryIndex];$('#gallery-image').src=`${A}p${f[0]}-hd.webp`;$('#gallery-image').alt=f[1];$('#gallery-title').textContent=f[1];$('#gallery-caption').textContent=f[3]||'';$('#gallery-index').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(galleryItems.length).padStart(2,'0')}${f[2]!=null?' · '+time(f[2]):''}`;$('#gallery-play').hidden=f[2]==null;$('.gallery-image-wrap').classList.remove('zoomed');$('#gallery-zoom').setAttribute('aria-pressed','false');$('#gallery-zoom').textContent='放大细节';}
function openFilm(t=0){pauseActVideos();pauseConceptVideos();pauseColorVideo();const gallery=$('#gallery-dialog');if(gallery.open)gallery.close();const d=$('#film-dialog');if(!d.open)d.showModal();document.body.classList.add('dialog-open');const v=$('#full-film'),source=v.querySelector('source');if(!source.getAttribute('src'))source.src=source.dataset.src;const seek=()=>{v.currentTime=t;v.play().catch(()=>{});};if(v.readyState>=1)seek();else{v.addEventListener('loadedmetadata',seek,{once:true});v.load();}}
function closeDialog(d){d.close();if(d.id==='film-dialog')$('#full-film').pause();document.body.classList.remove('dialog-open');}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.dataset.act!==undefined)jumpToAct(+b.dataset.act);if(b.dataset.gallery!==undefined){const act=acts[Number(b.dataset.galleryAct)];showGallery([act.main,...act.frames],+b.dataset.gallery);}if(b.dataset.film!==undefined)openFilm(+b.dataset.film);if(b.dataset.seek!==undefined)openFilm(+b.dataset.seek);if(b.classList.contains('close-dialog'))closeDialog(b.closest('dialog'));if(b.classList.contains('motion-switch')){motionEnabled=!motionEnabled;b.setAttribute('aria-pressed',motionEnabled);observeStage();}});
$$('dialog').forEach(d=>{d.addEventListener('cancel',e=>{e.preventDefault();closeDialog(d)});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}})});
$('#gallery-prev').onclick=()=>{galleryIndex=(galleryIndex-1+galleryItems.length)%galleryItems.length;updateGallery()};$('#gallery-next').onclick=()=>{galleryIndex=(galleryIndex+1)%galleryItems.length;updateGallery()};$('#gallery-play').onclick=()=>openFilm(galleryItems[galleryIndex][2]);$('#gallery-zoom').onclick=()=>{const z=$('.gallery-image-wrap').classList.toggle('zoomed');$('#gallery-zoom').setAttribute('aria-pressed',z);$('#gallery-zoom').textContent=z?'适应窗口':'放大细节'};
document.addEventListener('keydown',e=>{if($('#gallery-dialog').open){if(e.key==='ArrowLeft')$('#gallery-prev').click();if(e.key==='ArrowRight')$('#gallery-next').click();}else if(e.target.matches('[data-act]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const current=Number(e.target.dataset.act),i=e.key==='Home'?0:e.key==='End'?3:(current+(e.key==='ArrowRight'?1:3))%4;$(`#tab-${i}`).focus({preventScroll:true});jumpToAct(i);}});
$('#full-film').addEventListener('timeupdate',()=>{const t=$('#full-film').currentTime;$$('[data-seek]').forEach((b,i)=>b.classList.toggle('active',t>=acts[i].start&&(i===3||t<acts[i+1].start)));});
function setupReveal(){if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.body.classList.add('js-motion');const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=`${max?scrollY/max*100:0}%`;},{passive:true});
const navObserver=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){$$('.site-header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}})},{rootMargin:'-15% 0px -65% 0px'});
function setupNavigation(){$$('main section[id]').forEach(s=>navObserver.observe(s))}
renderActs();setupReveal();setupNavigation();queueStoryChapter();
const conceptItems=[[87,'行业内卷与乱象',null,'从狂沙、冰川到断剑残坊，用自然环境的压迫感替代对行业乱象的直接说教。'],[41,'坚守初心',null,'逆风中的侠客，与亲手铸剑的匠人共同构成人物叙事，让坚持变成行动。'],[42,'去伪存真',null,'用水下淬火、黑壳剥落和金色显露的材质变化，讲述去伪存真。'],[43,'粉丝凝聚力',null,'将辛选图腾嵌入叙事，让灵石、熔火、阵纹与万剑形成递进的视觉线索。'],[44,'品牌宣战',null,'以一半人物、一半雄狮的终帧，收束回归、聚力与亮剑的品牌宣言。']];
const swords=[[45,'矿石原石',null,'灵岩嵌辛选图腾，孕育第一缕光，初心未凿。'],[46,'石质剑坯',null,'粗坯初见锋芒，千锤造形。'],[48,'黑金重剑',null,'黑金回纹百炼，锋芒初显。'],[47,'金纹神剑',null,'鎏金铭文 545818，众心铸锋。']];
const characters=[[93,'风雪侠客',null,'斗笠与黑袍，在冷调环境中建立苦行者形象。'],[71,'面部设定',null,'保留人物面部识别，建立稳定的影像人物形象。'],[82,'服装正面',null,'以深色层叠服装与披风统一人物造型。'],[60,'背部视图',null,'黑袍与斗笠构成清晰的轮廓锚点。']];
const motifs=[[50,'雄狮 · 王者',null,'巨像与狮首剑格，承载原力与王者之气。'],[51,'辛选图腾 · 聚力',null,'从灵石到地面阵纹，反复出现，逐级放大。'],[52,'545818 · 众心',null,'数字与回纹一同铸刻，让数据成为视觉符号。'],[53,'剑冢与万剑',null,'断剑代表旧的困境，万剑响应代表众心凝聚。']];
const colors=[[87,'废土黄沙','孤独 · 隐忍 · 逆风'],[50,'幽冥冰川','敬畏 · 孤寒 · 蓄势'],[63,'暗夜熔炉','炽热 · 专注 · 淬炼'],[73,'青铜熔脉','聚势 · 同心 · 觉醒'],[72,'破晓金光','破壁 · 出锋 · 锋芒']];
let conceptIndex=0,swordIndex=0,characterIndex=0;
function swapImage(el,path,alt){el.style.animation='none';el.src=path;el.srcset=path.endsWith('.webp')&&!path.includes('-hd')?`${path} 1x, ${path.replace('.webp','-hd.webp')} 2x`:path;el.alt=alt;void el.offsetWidth;el.style.animation='';}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.concept!==undefined)selectConcept(+b.dataset.concept,true);if(b.dataset.sword!==undefined){swordIndex=+b.dataset.sword;const f=swords[swordIndex];$$('[data-sword]').forEach((el,i)=>el.setAttribute('aria-pressed',i===swordIndex));swapImage($('#sword-image'),`${A}p${f[0]}.webp`,f[1]);$('#sword-image-button').setAttribute('aria-label','查看高清：'+f[1]);$('#sword-name').textContent=f[1];$('#sword-description').textContent=f[3];}if(b.dataset.character!==undefined){characterIndex=+b.dataset.character;const f=characters[characterIndex];$$('[data-character]').forEach((el,i)=>el.setAttribute('aria-pressed',i===characterIndex));swapImage($('#character-image'),`${A}p${f[0]}.webp`,f[1]);$('#character-image-button').setAttribute('aria-label','查看高清：'+f[1]);$('#character-image-button').dataset.characterView=characterIndex;$('#character-view-number').textContent=`0${characterIndex+1} / 04`;$('#character-name').textContent=f[1];$('#character-description').textContent=f[3];}if(b.dataset.motif!==undefined)showGallery(motifs,+b.dataset.motif);if(b.dataset.type!==undefined)showGallery([[94,'剑成 · 书法',null,'朱红书法，用于片名与情绪转场。'],[92,'亮剑 · 书法',null,'白色书法压题，完成最终亮剑。']],+b.dataset.type);if(b.dataset.color!==undefined)jumpToColor(+b.dataset.color);});
$('#concept-view').onclick=()=>showGallery(conceptItems,conceptIndex);$('#sword-image-button').onclick=()=>showGallery(swords,swordIndex);$('#character-image-button').onclick=()=>showGallery(characters,characterIndex);
const countsObserver=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;countsObserver.unobserve(e.target);if(matchMedia('(prefers-reduced-motion: reduce)').matches)continue;const start=performance.now();const items=[...e.target.querySelectorAll('[data-count]')];function tick(now){const x=Math.min(1,(now-start)/1600),ease=1-Math.pow(1-x,3);items.forEach(el=>el.textContent=(+el.dataset.count*ease).toFixed(+el.dataset.decimals||0));if(x<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}},{threshold:.35});countsObserver.observe($('.results-grid'));setupReveal();setupNavigation();
let touchStartX=0;$('.gallery-image-wrap').addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});$('.gallery-image-wrap').addEventListener('touchend',e=>{if($('.gallery-image-wrap').classList.contains('zoomed'))return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>70)(dx<0?$('#gallery-next'):$('#gallery-prev')).click()},{passive:true});
document.addEventListener('visibilitychange',syncActVideos);
$$('dialog').forEach(d=>d.addEventListener('close',()=>{document.body.classList.remove('dialog-open');observeStage();queueStoryChapter()}));

// Load only visible excerpts; retain the original still if autoplay is unavailable.
const conceptReduced=matchMedia('(prefers-reduced-motion: reduce)'),conceptVideos=$$('.concept-video'),conceptVisible=new Set();
let conceptMotion=!conceptReduced.matches;
function pauseConceptVideos(){conceptVideos.forEach(v=>v.pause());}
function syncConceptVideos(){
 $('#concept-motion-toggle').textContent=conceptMotion?'暂停片段':'播放片段';
 $('#concept-motion-toggle').setAttribute('aria-pressed',String(conceptMotion));
 conceptVideos.forEach(v=>{
  if(!conceptMotion||document.hidden||document.querySelector('dialog[open]')||!conceptVisible.has(v)){v.pause();return;}
  if(!v.getAttribute('src')){v.src=v.dataset.src;v.load();}
  v.muted=true;v.defaultMuted=true;v.play().catch(()=>{});
 });
}
conceptVideos.forEach(v=>{v.addEventListener('playing',()=>v.classList.add('is-playing'));v.addEventListener('error',()=>v.classList.remove('is-playing'));});
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?conceptVisible.add(e.target):conceptVisible.delete(e.target));syncConceptVideos();},{threshold:.15});
 conceptVideos.forEach(v=>observer.observe(v));
}else{conceptVideos.forEach(v=>conceptVisible.add(v));syncConceptVideos();}
$('#concept-motion-toggle').addEventListener('click',()=>{conceptMotion=!conceptMotion;syncConceptVideos();});
document.addEventListener('visibilitychange',syncConceptVideos);
conceptReduced.addEventListener('change',()=>{conceptMotion=!conceptReduced.matches;syncConceptVideos();});
$$('dialog').forEach(d=>d.addEventListener('close',syncConceptVideos));
syncConceptVideos();

// The centered concept card owns the explanation below the carousel.
const conceptTrack=$('.concept-grid'),conceptCards=$$('[data-concept]');let conceptScrollQueued=false;
function selectConcept(index,center=false){
 conceptIndex=index;conceptCards.forEach((card,i)=>card.setAttribute('aria-pressed',String(i===index)));
 $('#concept-focus-text').textContent=conceptItems[index][3];$('.focus-label').textContent=`视觉转译 / 0${index+1}`;
 if(center){const card=conceptCards[index].getBoundingClientRect(),track=conceptTrack.getBoundingClientRect();conceptTrack.scrollTo({left:conceptTrack.scrollLeft+card.left+card.width/2-track.left-track.width/2,behavior:conceptReduced.matches?'instant':'smooth'});}
}
conceptTrack.addEventListener('scroll',()=>{if(conceptScrollQueued)return;conceptScrollQueued=true;requestAnimationFrame(()=>{conceptScrollQueued=false;const track=conceptTrack.getBoundingClientRect(),center=track.left+track.width/2;let nearest=0,distance=Infinity;conceptCards.forEach((card,i)=>{const r=card.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<distance){distance=d;nearest=i;}});if(nearest!==conceptIndex)selectConcept(nearest);});},{passive:true});
conceptCards.forEach((card,index)=>card.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?4:Math.max(0,Math.min(4,index+(e.key==='ArrowRight'?1:-1)));conceptCards[i].focus({preventScroll:true});selectConcept(i,true);}));

// A single original-resolution film supplies five matching color passages.
const colorVideo=$('#color-video'),colorScene=$('.color-scene'),colorBench=$('.color-workbench'),colorButtons=$$('[data-color]');
const colorRanges=[[0,2.4],[9,11.4],[31.2,33.6],[48.2,50.6],[68,70.4]];
let colorIndex=0,colorVisible=false,colorMotion=!conceptReduced.matches,colorScrollQueued=false;
function pauseColorVideo(){colorVideo.pause();}
function seekColorVideo(){if(colorVideo.readyState>=1){colorVideo.classList.remove('is-playing');colorVideo.currentTime=colorRanges[colorIndex][0];}}
function syncColorVideo(){
 $('#color-motion-toggle').textContent=colorMotion?'暂停动态':'播放动态';$('#color-motion-toggle').setAttribute('aria-pressed',String(colorMotion));
 if(!colorVisible||!colorMotion||document.hidden||document.querySelector('dialog[open]')){pauseColorVideo();return;}
 if(!colorVideo.getAttribute('src')){colorVideo.src=$('#full-film source').dataset.src;colorVideo.load();}
 colorVideo.muted=true;colorVideo.play().catch(()=>{});
}
function setColor(i){
 colorIndex=i;const f=colors[i];colorButtons.forEach((button,j)=>button.setAttribute('aria-pressed',String(j===i)));
 swapImage($('#color-image'),`${A}p${f[0]}.webp`,f[1]);colorVideo.poster=`${A}p${f[0]}.webp`;
 $('#color-phase').textContent=`0${i+1} / ${f[1]}`;$('#color-emotion').textContent=f[2];seekColorVideo();syncColorVideo();
}
function jumpToColor(i){const row=colorButtons[i].getBoundingClientRect(),scene=colorScene.getBoundingClientRect();window.scrollTo({top:scrollY+row.top+row.height/2-parseFloat(getComputedStyle(colorScene).top)-scene.height/2,behavior:conceptReduced.matches?'instant':'smooth'});setColor(i);}
function followColor(){
 colorScrollQueued=false;if(document.querySelector('dialog[open]'))return;const bench=colorBench.getBoundingClientRect();if(bench.bottom<100||bench.top>innerHeight)return;
 const scene=colorScene.getBoundingClientRect(),line=scene.top+scene.height/2;let nearest=0,distance=Infinity;
 colorButtons.forEach((button,i)=>{const row=button.getBoundingClientRect(),d=Math.abs(row.top+row.height/2-line);if(d<distance){distance=d;nearest=i;}});
 if(nearest!==colorIndex)setColor(nearest);
}
function queueColor(){if(!colorScrollQueued){colorScrollQueued=true;requestAnimationFrame(followColor);}}
window.addEventListener('scroll',queueColor,{passive:true});window.addEventListener('resize',queueColor);
colorVideo.addEventListener('loadedmetadata',seekColorVideo);
colorVideo.addEventListener('seeking',()=>colorVideo.classList.remove('is-playing'));
function revealColor(){if(!colorVideo.seeking&&!colorVideo.paused)colorVideo.classList.add('is-playing');}
colorVideo.addEventListener('playing',revealColor);colorVideo.addEventListener('seeked',revealColor);
colorVideo.addEventListener('error',()=>colorVideo.classList.remove('is-playing'));
colorVideo.addEventListener('timeupdate',()=>{if(colorVideo.seeking)return;const[start,end]=colorRanges[colorIndex];if(colorVideo.currentTime>=end-.06||colorVideo.currentTime<start-.1)seekColorVideo();});
new IntersectionObserver(entries=>{colorVisible=entries[0].isIntersecting;syncColorVideo();},{threshold:.1}).observe(colorVideo);
$('#color-motion-toggle').addEventListener('click',()=>{colorMotion=!colorMotion;syncColorVideo();});
document.addEventListener('visibilitychange',syncColorVideo);$$('dialog').forEach(d=>d.addEventListener('close',syncColorVideo));
conceptReduced.addEventListener('change',()=>{colorMotion=!conceptReduced.matches;syncColorVideo();});
