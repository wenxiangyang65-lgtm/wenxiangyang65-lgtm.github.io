'use strict';
const $ = (id) => document.getElementById(id);
const src = (id) => './media/' + id + '.webp';
const videoSrc = (id) => window.PORTFOLIO_VIDEO_SOURCES?.[id] || './media/'+id+'.mp4';
const words = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const projectNotes={
  structure:'场地编号图，用来对照中屏、两翼、楼梯屏与现场位置。',
  mockup:'把红金会标与品牌卡面做成正背组合，展示镜头中如何露出品牌。',
  supermarket:'用人物居中与上下两组金色大字，让超市活动名先被读到。',
  gala:'收官舞台现场。阶梯中轴与左右屏形成纵深，红色统一各屏画面。',
  carpet:'红毯识别物料。白底压低装饰，保留盛典名称和活动信息。',
  chess:'初瑞雪主题方案。金狮与棋盘落在中屏，侧屏接续棋盘与边框。',
  shelf:'民生专区方案。用连续货架和顶部标题提示商品品类与专区身份。',
  'shelf-live':'现场竖屏画面。标题放在上方，人物可在货架画面前清楚出镜。',
  fish:'鱼油拍摄背景。保留包装主色与瓶身周围的浅色留白。',
  skincare:'天气丹拍摄背景。香槟金材质衬托套盒，品牌字样留在上方。',
  bed:'慕思拍摄背景。用中轴与灯带引导视线，突出中景床具。',
  'p3-03':'以多个全身剪影表现同一条牛仔裤的搭配变化。',
  'p3-04':'用全身站姿展示衬衫的搭配效果，标题靠下保留人物轮廓。',
  'p3-12':'在户外全身画面中清楚展示裤型和穿搭比例。',
  'p3-10':'用双人同框和低饱和暖色呈现衬衫风格。',
  'p3-11':'近一点交代人物与衣料，标题点出亚麻材质。',
  'p3-13':'用暖色背景衬托深色上衣，标题落在下部留白。',
  'skin-raw':'保留正脸和举起的面霜，作为产品与人物关系的底图。',
  'skin-final':'文字放在面霜旁边的下半部，保持脸部和产品可见。',
  'clip-raw':'原直播画面自带人物、礼盒和展台背景。',
  'p4-03':'将价格放入角标，把送礼理由整理成两行标题。',
  'p1-15':'全身造型先入画，秀场标题下移到服装边缘。',
  'p1-04':'用上下两段场景和同一组暖色，连起今昔叙事。',
  'p1-12':'以人物面部和大数字分层，读完倒计时仍能看清人物。',
  'p1-17':'红色帘幕形成舞台纵深，金色标题避开脸部。',
  'p1-18':'保留走秀街景和多人造型，以时装刊物式标题呈现发布。',
  'horse-type':'骏马迎春的白色主题字样，独立输出方便换底与校字。',
  letters:'「携手辛选」金色题字，笔触保留高光和毛边。',
  'gold-type':'「all in 一切」落版字样，单独存档供合成与排版调整。',
  'preheat-raw':'保留人物受光和前景虚化，标题加入前先判断脸部安全区。',
  'day-text':'618 收官倒计时 3 天透明字层，可单独改字与位置。',
  'p1-02':'倒计时 3 天合成。大数字放在画面下半部，人物和场景仍可辨认。'
};
function art([id,title,note,shape], eager=false) {
  note = note || projectNotes[id];
  return '<figure class="shot '+(shape||'')+'"><button type="button" data-image="'+id+'" aria-label="放大查看 '+words(title)+'"><img src="'+src(id)+'" alt="'+words(title)+'" loading="'+(eager?'eager':'lazy')+'" decoding="async"></button><figcaption>'+words(title)+(note?'<small>'+words(note)+'</small>':'')+'</figcaption></figure>';
}
const gallery = (items, style = 'gallery') => '<div class="'+style+'">'+items.map(item=>art(item)).join('')+'</div>';
function tabs(container, labels, onPick, defaultIndex = 0) {
  container.innerHTML = labels.map(label=>'<button type="button">'+words(label)+'</button>').join('');
  const buttons = [...container.children];
  const select = (index) => {
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',i===index));
    onPick(index);
  };
  buttons.forEach((button,i) => {
    button.addEventListener('click',()=>select(i));
    button.addEventListener('keydown',(event)=>{
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;
      buttons[next].focus();select(next);
    });
  });
  select(defaultIndex);
  return select;
}
const projectCarouselRefreshers=[];
function projectCarousel(container,panel,labels,onPick,{kind='案例',delay=10000,autoplay=true,advance=null,visibilityTarget=null}={}){
  let index=0,enabled=autoplay&&!matchMedia('(prefers-reduced-motion: reduce)').matches,visible=false,hovered=false,timer;
  container.className='project-carousel';
  container.setAttribute('role','group');
  container.setAttribute('aria-label',kind+'轮播控制');
  container.innerHTML='<div class="project-carousel-current"><span class="project-carousel-count"></span><span class="project-carousel-title" tabindex="-1"></span></div>'+
    '<div class="project-carousel-actions"><button type="button" class="project-carousel-auto"></button>'+
    '<button type="button" class="project-carousel-prev" aria-label="上一'+kind+'" aria-controls="'+panel.id+'">←</button>'+
    '<button type="button" class="project-carousel-next" aria-label="下一'+kind+'" aria-controls="'+panel.id+'">→</button></div>';
  const auto=container.querySelector('.project-carousel-auto');
  const refresh=()=>{
    clearTimeout(timer);
    const playing=[...panel.querySelectorAll('video')].some(video=>!video.paused&&!video.ended);
    if(enabled&&visible&&!document.hidden&&!$('viewer').open&&!hovered&&!playing&&!panel.contains(document.activeElement)){
      timer=setTimeout(()=>{if(advance)advance(index,select);else select(index+1);refresh()},delay);
    }
  };
  const renderAuto=()=>{auto.textContent=enabled?'暂停自动切换':'开启自动切换';auto.setAttribute('aria-pressed',String(enabled));refresh()};
  const select=(next)=>{
    const previous=index;
    index=(next+labels.length)%labels.length;
    onPick(index);
    container.querySelector('.project-carousel-count').textContent=String(index+1).padStart(2,'0')+' / '+String(labels.length).padStart(2,'0');
    container.querySelector('.project-carousel-title').textContent=labels[index];
    panel.setAttribute('role','region');
    panel.setAttribute('aria-label',labels[index]);
    panel.setAttribute('aria-roledescription','轮播内容');
    if(previous!==index&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      panel.getAnimations().forEach(animation=>animation.cancel());
      panel.animate([{opacity:.65,transform:'translateX('+(next>previous?12:-12)+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:280,easing:'ease-out'});
    }
    refresh();
  };
  auto.onclick=()=>{enabled=!enabled;renderAuto()};
  container.querySelector('.project-carousel-prev').onclick=()=>select(index-1);
  container.querySelector('.project-carousel-next').onclick=()=>select(index+1);
  container.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();select(event.key==='Home'?0:event.key==='End'?labels.length-1:index+(event.key==='ArrowLeft'?-1:1));
  });
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh()},{threshold:.2}).observe(visibilityTarget||container);
  panel.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;refresh()}});
  panel.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){hovered=false;refresh()}});
  for(const event of ['play','pause','ended','focusin','focusout'])panel.addEventListener(event,()=>setTimeout(refresh,0),true);
  let touchStart=null,suppressClickUntil=0;
  panel.addEventListener('touchstart',event=>{
    if(event.touches.length!==1||event.target.closest('input,select,.story-frames,.cover-carousel')){touchStart=null;return}
    const video=event.target.closest('video');
    if(video&&event.touches[0].clientY>video.getBoundingClientRect().bottom-56){touchStart=null;return}
    clearTimeout(timer);
    touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  panel.addEventListener('touchmove',event=>{
    if(!touchStart||event.touches.length!==1){touchStart=null;refresh();return}
    const dx=event.touches[0].clientX-touchStart.x,dy=event.touches[0].clientY-touchStart.y;
    if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.3&&event.cancelable)event.preventDefault();
  },{passive:false});
  panel.addEventListener('touchend',event=>{
    if(!touchStart){refresh();return}
    const end=event.changedTouches[0],dx=end.clientX-touchStart.x,dy=end.clientY-touchStart.y;
    touchStart=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){
      suppressClickUntil=performance.now()+500;
      select(index+(dx<0?1:-1));
    }else refresh();
  },{passive:true});
  panel.addEventListener('touchcancel',()=>{touchStart=null;refresh()},{passive:true});
  panel.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}
  },true);
  projectCarouselRefreshers.push(refresh);
  select.refresh=refresh;
  select(0);renderAuto();
  return select;
}
function wall(id, keys, eager=false) {
  $(id).innerHTML=keys.map(k=>'<img src="'+src(k)+'" alt="" '+(eager?'':'loading="lazy"')+' decoding="async">').join('');
}
wall('wall-top',['p1-15','p1-04','horse-cover','p1-12','p1-06','p3-01','sword-cover','p1-18','snow'],true);
wall('wall-middle',['cover-fashion-show','ready','p1-17','p3-color-styling','p1-03','cover-fashion-sail','p2-01','newyear','cover-forty']);
wall('wall-bottom',['p1-01','cover-spring-runway','p3-10','p1-02','p3-02','p3-12','wish-cover-portrait','p2-06','xujie-cover']);

const films=[
  {title:'骏马生花',cover:'horse-cover',coverName:'封面题字 · 骏马迎春',video:'horse',credit:'初瑞雪 · 开年人设视频',intro:'以白马陪伴初瑞雪从雪山走到花田与城市，用由冬入春的旅程呈现她的新年亮相。',frames:[
    ['horse-0','00:05','雪山开场','冷色远山和人物侧影交代冬季。'],
    ["horse-shot-25", "00:25", "雪林见光", "逆光穿过雪林，让冬景开始转暖。"],
    ["horse-shot-33", "00:33", "花从雪中显现", "用花朵近景铺垫季节转换。"],
    ['horse-2','00:41','花田转场','白马穿过花田，把冬景接到新春。'],
    ['horse-3','01:00','白马奔跑','横向跟拍式构图和虚化拉开速度感。'],
    ["horse-shot-83", "01:23", "城市落点", "人物与白马面对城市，把奇幻旅程带回现实。"]]},
  {title:'剑成',cover:'sword-cover',video:'sword',portrait:true,credit:'陈先生 · 亮剑回归直播',intro:'《剑成》是陈先生回归直播的预热片。影片以取火、铸剑和持剑亮相，铺垫回归。',frames:[
    ['sword-0','00:05','人物出场','逆光先交代人物轮廓和氛围。'],
    ["sword-shot-12", "00:12", "狮影出现", "冰蓝色远景先建立狮王意象，与后段炉火形成冷暖反差。"],
    ['sword-2','00:29','火中锻造','红热金属与火花集中在锻造动作。'],
    ["sword-shot-46", "00:46", "质字印记", "烧红的字形把锻造过程落到品质主题。"],
    ["sword-shot-53", "00:53", "陈先生持剑", "正面近景将铸剑结果与主播形象关联。"],
    ['sword-4','01:02','剑阵收尾','近剑与远景重复的剑阵把主题收回到「成剑」。']]},
  {title:'辛巴门徒',cover:'xujie-cover',coverName:'徐杰 · 写实版',video:'xujie',portrait:true,credit:'徐杰 · 拜师礼写实版',intro:'徐杰的角色进入宫殿、会见象征辛巴的狮王，再以权杖交接完成仪式。',frames:[
    ['xujie-0','00:07','入殿','中轴和两侧狮群交代空间尺度。'],
    ["xujie-shot-13", "00:13", "徐杰角色近景", "用面部与头冠建立人物辨识。"],
    ['xujie-1','00:24','与狮王会面','对位构图交代人物关系。'],
    ["xujie-shot-42", "00:42", "狮王回应", "狮王近景把会面转向交接。"],
    ["xujie-shot-57", "00:57", "权杖与流光", "让光效绕着权杖向上，带入仪式高潮。"],
    ['xujie-2','01:03','殿内仪式','顶光和地面光效把视线收向仪式中心。']]},
  {title:'逆境中开花',cover:'snow',coverName:'初瑞雪 · 人物传记',video:'snow',credit:'初瑞雪 · 人物传记',intro:'母女关系是主线，从童年与创业讲到舞台时刻，再回到辛选。',frames:[
    ['snow-frame-0','00:03','童年学步','手部的第一人称视角引出母女关系。'],
    ['snow-shot-55','00:55','深夜打包','手部近景和成堆包裹交代创业初期的打包工作。'],
    ['snow-shot-66','01:06','母女合影','从手机屏幕看到母女合影，接回两人的故事。'],
    ['snow-shot-120','02:00','创业段落','用散落的纸张和空下来的工位交代创业低谷。'],
    ['snow-frame-2','03:11','舞台时刻','沿着舞台中轴切入高光场面。'],
    ["snow-shot-226", "03:46", "回到辛选", "空镜与台上字样把人物故事接回辛选。"]]},
  {title:'辛选年货为你而来',cover:'newyear',video:'newyear',portrait:true,credit:'辛选年货节 · 品牌宣传',intro:'由船锚、货车、山区产地和海运串起年货旅程，最后发出活动邀约。',frames:[
    ['newyear-frame-0','00:03','海下船锚','从水下特写带出货源的第一段行程。'],
    ['newyear-frame-1','00:09','车队出发','红色货车与封面中的物流主题呼应。'],
    ["newyear-shot-18", "00:18", "产区交代", "山地全景配合产区字样，把货源讲具体。"],
    ['newyear-frame-2','00:26','穿山运输','高位视角让车队与产地环境同框。'],
    ["newyear-shot-36", "00:36", "海上运输", "海面与船只扩展年货集货的空间。"],
    ["newyear-shot-50", "00:50", "集结完毕", "港口全景与落版字样交代到货。"]]},
  {title:'一切就绪',cover:'ready',video:'ready-return-show',credit:'初瑞雪 · 8 月 8 日回归首秀',intro:'从城市与主播亮相切到团队筹备、海陆运输，最后回到首秀舞台。',frames:[
    ['ready-return-shot-1','00:01','城市开场','城市远景带出回归主题。'],
    ['ready-return-shot-10','00:10','电梯亮相','背影与镜中人物同框，字幕提示首秀时间。'],
    ['ready-return-shot-15','00:15','团队筹备','从人物亮相切到团队筹备现场。'],
    ['ready-return-shot-45','00:45','海上运输','船头画面接入海上运输。'],
    ['ready-return-shot-75','01:15','陆路运输','用货车车轮特写衔接物流段落。'],
    ['ready-return-shot-85','01:25','首秀登场','红色舞台与回归字样收束预告。']]},
  {title:'一拳定音',cover:'punch',video:'punch',credit:'辛选 828 · 人物预热',intro:'以入场、绑拳带、训练和出拳蓄势，最后以站上擂台回应片名。',frames:[
    ["punch-shot-3", "00:03", "逆光入场", "先用侧逆光交代人物进入训练空间。"],
    ['punch-frame-0','00:09','擂台交锋','双方在同一画面完成动作对位。'],
    ['punch-frame-1','00:16','拳带特写','停在手部动作上，切出开打前的节奏。'],
    ['punch-frame-2','00:36','训练段落','侧光保留动作轮廓与训练空间。'],
    ["punch-shot-50", "00:50", "出拳加速", "紧贴动作切换，让训练段落进入高潮。"],
    ["punch-shot-65", "01:05", "站上擂台", "用场馆全景收束人物从训练到登场的过程。"]]},
  {title:'许我一匹马吧',cover:'wish-cover-portrait',video:'wish',portrait:true,credit:'时大漂亮 · 3 月 14 日回归预热',intro:'从人物特写到骑乘跃过沙丘，以人马肖像收束重新出发的主题。',frames:[
    ["wish-shot-1", "00:01", "人物开场", "先给面部近景，让回归预告有清晰的人物主体。"],
    ['wish-frame-0','00:09','马蹄扬沙','用蹄落与砂粒特写建立速度。'],
    ["wish-shot-12", "00:12", "白衣骑乘", "白衣造型从马蹄近景切换到人物行动。"],
    ['wish-frame-1','00:16','跃过沙丘','全景将骑手剪影放进高饱和日落。'],
    ['wish-frame-2','00:26','披风与马背','红色披风延续跑动方向与画面色调。'],
    ["wish-shot-33", "00:33", "人马肖像", "黑色造型与马同框，将出发主题收回人物。"]]}
];
function playButton(project) {
  return '<button class="film-trigger" type="button" data-video="'+project.video+'" aria-label="播放《'+words(project.title)+'》"><span aria-hidden="true">▶</span><span>播放</span></button>';
}
function filmCard(project, index) {
  const caption=project.coverName || '影片封面';
  return '<article class="film-card">'+art([project.cover,'《'+project.title+'》',caption], index===undefined)+
    '<div class="film-controls">'+playButton(project)+
    (index===undefined?'':'<button class="frame-trigger" type="button" data-film-index="'+index+'">看分镜 <span aria-hidden="true">↗</span></button>')+
    '</div><p class="film-note"><strong>'+words(project.credit)+'</strong>'+words(project.intro)+'</p></article>';
}
let film=0, frame=0;
const shotNumber=index=>String(index+1).padStart(2,'0');
function frameSeconds(time){
  const [minutes,seconds]=time.split(':').map(Number);
  return minutes*60+seconds;
}
function showFrame(i) {
  const list=films[film].frames; frame=(i+list.length)%list.length;
  const [key, time, title, note]=list[frame], image=$('film-frame');
  image.classList.remove('in');image.src=src(key);image.alt=films[film].title+' · '+title;
  requestAnimationFrame(()=>image.classList.add('in'));
  image.closest('button').dataset.image=key;
  $('frame-count').textContent=shotNumber(frame)+' / '+shotNumber(list.length-1);
  $('frame-caption').textContent=time+' · '+title;
  const play=$('frame-play');
  play.dataset.video=films[film].video;
  play.dataset.start=frameSeconds(time);
  play.setAttribute('aria-label','从 '+time+' 播放《'+films[film].title+'》');
  $('frame-note').textContent=note;
  $('film-frames').querySelectorAll('button').forEach((b,n)=>b.setAttribute('aria-pressed',n===frame));
}
function pickFilm(i) {
  film=i;
  const project=films[i];
  $('viewport').classList.toggle('is-portrait',!!project.portrait);
  $('story-body').classList.toggle('is-portrait',!!project.portrait);
  $('film-poster').innerHTML=filmCard(project);
  const strip=$('film-frames');
  strip.innerHTML=project.frames.map(([key,time,title],index)=>
    '<li><button type="button" aria-label="分镜 '+shotNumber(index)+'，'+words(time+' '+title)+'">'+
    '<img src="'+src(key)+'" alt=""><span class="story-frame-text"><span class="story-frame-meta">'+
    '<span>'+shotNumber(index)+'</span><span>'+words(time)+'</span></span><span class="story-frame-title">'+words(title)+'</span></span></button></li>'
  ).join('');
  strip.querySelectorAll('button').forEach((button,index)=>{
    button.onclick=()=>{showFrame(index);pickFilmTab.refresh()};
  });
  showFrame(0);
}
const pickFilmTab=projectCarousel($('film-tabs'),$('film-layout'),films.map(f=>f.title),pickFilm,{
  kind:'部影片',delay:5200,visibilityTarget:$('viewport'),
  advance:(index,select)=>{if(frame<films[film].frames.length-1)showFrame(frame+1);else select(index+1)}
});
$('frame-prev').onclick=()=>{showFrame(frame-1);pickFilmTab.refresh()};
$('frame-next').onclick=()=>{showFrame(frame+1);pickFilmTab.refresh()};
$('more-films').innerHTML=films.map(filmCard).join('');
$('more-films').addEventListener('click',event=>{
  const button=event.target.closest('[data-film-index]');
  if(!button)return;
  const index=Number(button.dataset.filmIndex);
  pickFilmTab(index);
  $('film-tabs').querySelector('.project-carousel-title').focus({preventScroll:true});
  $('film-tabs').scrollIntoView({block:'start'});
});

const lists=[
  ['opening','活动首屏','活动口号与开播信息挤在同一画面，视觉重心分散，氛围感不足。','以群像画面烘托活动氛围，活动名称、开播时间收拢在主标区域，主题聚焦、仪式感更强。'],
  ['welfare','福利补贴','首屏直接跳转爆品清单，福利活动没有独立板块，福利感知弱。','单独搭建福利专区，优先突出活动频次与奖品，再展示商品，福利氛围感更强。'],
  ['product','爆品 · 天气丹','商品图与卖点信息拥挤在单张卡片，信息堆叠，重点不突出。','重构信息层级，拆分主视觉场景种草图与卖点模块，双卖点卡片独立承载内容，阅读动线更顺畅。'],
  ['food','食品零食','模块布局较散，标题层级不清晰，商品视觉重点不足。','食品零食专区新版采用三栏卡片布局，统一商品展示规格，强化标题层级与视觉动线，提升页面美观度和浏览效率。'],
  ['entry','直播入口','结尾提示到直播间查看商品。','新版补了搜索账号和关注主播两步实机指引。']
];
function listLongView(key,title,note){
  return '<figure><figcaption><strong>'+words(title)+'</strong><small>'+words(note)+'</small></figcaption>'+
    '<div class="list-long-window" tabindex="0" role="region" aria-label="'+words(title)+'">'+
    '<img src="'+src(key)+'" alt="'+words(title)+'" loading="lazy" decoding="async"></div></figure>';
}
tabs($('list-tabs'),lists.map(item=>item[1]),index=>{
  const [key,title,oldNote,newNote]=lists[index];
  $('list-panel').innerHTML='<div class="list-comparison" aria-label="'+words(title)+'修改前后对照">'+
    '<section class="list-old"><h3>改前 · '+words(title)+'</h3>'+art([key+'-old',title+' · 改前',oldNote])+'</section>'+
    '<section class="list-new"><h3>改后 · '+words(title)+'</h3>'+art([key+'-new',title+' · 改后',newNote])+'</section>'+
    '</div>';
});
$('list-full').innerHTML=listLongView('campaign-list-original','改前完整原图','活动首屏到直播入口')+
  listLongView('campaign-list-revised','改后完整长图','五个存档模块按页面顺序汇总');
const screenGroups=[
  {key:'special',title:'主题专场',picks:['screen-clothing-event','screen-themed-moon','screen-themed-supermarket','screen-themed-store']},
  {key:'daily',title:'日播情景',picks:['daily-0867','daily-0881','daily-0871','live-0885','daily-0865','daily-0876']}
];
const screenObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
    const video=entry.target;
    if(entry.isIntersecting && !$('viewer').open && !matchMedia('(prefers-reduced-motion: reduce)').matches){
      video.play().catch(()=>{});
    }else{
      video.pause();
    }
  }
},{threshold:.2});
function screenThumb(item){
  return '<img src="'+src(item.key)+'" alt="" loading="lazy" decoding="async">'+
    '<span>'+words(item.title)+'</span>'+(item.video?'<i aria-hidden="true">▶</i>':'');
}
function screenGallery(items){
  return items.map(item=>art([item.key,item.title,item.note,'native'])).join('');
}
function screenAsset(item, eager=false){
  if(!item.video)return art([item.key,item.title,'','native'],eager);
  return '<video controls muted playsinline preload="none" aria-label="'+words(item.title)+'" poster="'+src(item.key)+'" src="'+videoSrc(item.key)+'"></video>';
}
function screenComparison(item,label,eager){
  return '<div class="screen-comparison-item"><h5>'+words(label)+'</h5>'+
    '<div class="screen-comparison-media">'+screenAsset(item,eager)+'</div>'+
    (item.video?'<p>'+words(item.title)+'</p>':'')+'</div>';
}
function screenMaterials(item){
  const heading='<h5>'+words(item.materialsTitle||'卡牌拍摄物料')+'</h5>';
  const materials=screenGallery(item.materials);
  if(!item.brandCards){
    return '<section class="screen-materials">'+heading+'<div class="screen-minis">'+materials+'</div></section>';
  }
  return '<section class="screen-materials card-materials">'+heading+
    '<div class="card-materials-layout">'+
    '<div><h6>主视觉与主题卡</h6><div class="screen-minis card-main">'+materials+'</div></div>'+
    '<div class="card-brand-panel"><h6>品牌卡牌</h6><div class="screen-minis card-brands">'+
    screenGallery(item.brandCards)+'</div></div></div></section>';
}
function cardMediaBoard(item){
  const [hold,ai,reference]=item.reels;
  const videoFigure=(asset,style)=>'<figure class="card-media-tile '+style+'"><div class="card-media-frame">'+
    screenAsset(asset)+'</div><figcaption>'+words(asset.title)+'</figcaption></figure>';
  return '<section class="card-media-board" aria-labelledby="card-media-heading">'+
    '<h5 id="card-media-heading">现场与 AI 动态</h5><div class="card-media-layout">'+
    videoFigure(hold,'card-media-hold')+videoFigure(item.live,'card-media-live')+
    videoFigure(ai,'card-media-ai')+
    '<div class="card-media-tile card-media-reference">'+screenAsset(reference)+'</div>'+
    '</div></section>';
}
function stageSupportingViews(item){
  const live=item.id==='campaign-cards'?cardMediaBoard(item):
    '<div class="stage-evidence-grid">'+(item.live?screenComparison(item.live,item.liveLabel||'现场实拍',true):'')+
    (item.footage?screenComparison(item.footage,'同场进场视频',false):'')+'</div>';
  const hasMaterials=!!item.materials;
  return '<section class="stage-support" aria-label="'+words(item.title)+'落地与物料">'+
    '<div class="stage-view-tabs" role="group" aria-label="查看案例细节">'+
    '<button type="button" data-stage-view="live" aria-pressed="true">现场与动态</button>'+
    (hasMaterials?'<button type="button" data-stage-view="materials" aria-pressed="false">配套物料</button>':'')+'</div>'+
    '<div data-stage-pane="live">'+live+'</div>'+
    (hasMaterials?'<div data-stage-pane="materials" hidden>'+screenMaterials(item)+'</div>':'')+'</section>';
}
const stageContributions={
  'campaign-cards':['三联屏视觉、动态合成与卡牌物料设计','开场 / 持续动效 · 品牌卡牌 · 拍摄物料'],
  'campaign-chess':['金狮棋盘场景与三联屏动态设计','三联屏动效 · 现场效果对照'],
  'campaign-xujie-crown':['皇冠场景设计与裸眼屏体适配','皇冠三联动效 · 静态效果稿'],
  'campaign-d11':['狮王主视觉与火焰场景延展','三联屏动效 · 同场进场视频'],
  'campaign-618':['皇冠主屏视觉与动态合成','主屏动效 · 现场效果对照']
};
function screenContribution(item){
  const [work,delivery]=stageContributions[item.id]||['商品屏视觉与拍摄背景设计',
    item.design.video?'商品动态背景':/triple|gapped/.test(item.design.key)?'三联屏效果稿':'商品屏效果稿'];
  return '<dl class="case-contribution"><div><dt>我的工作</dt><dd>'+words(work)+'</dd></div><div><dt>交付</dt><dd>'+words(delivery)+'</dd></div></dl>';
}
function mountScreenCases(tabId,panelId,items){
  const panel=$(panelId),isStage=tabId==='screen-on-site-tabs';
  const render=index=>{
    panel.querySelectorAll('video').forEach(video=>video.pause());
    const item=items[index];
    panel.innerHTML='<article class="screen-case"'+(item.id?' id="'+item.id+'"':'')+'>'+
      '<header class="screen-comparison-heading"><div><h4 class="source-sr-only">'+words(item.title)+'</h4><p>'+words(item.note)+'</p></div>'+
      (item.cover?'<a class="case-link" href="#'+item.cover+'">看同场封面 ↗</a>':'')+'</header>'+screenContribution(item)+
      '<div class="screen-comparison-grid">'+screenComparison(item.design,'屏幕设计',true)+
      (!isStage&&item.live?screenComparison(item.live,item.liveLabel||'现场实拍',true):'')+'</div>'+
      (isStage?stageSupportingViews(item):(item.materials?screenMaterials(item):''))+'</article>';
    panel.querySelectorAll('[data-stage-view]').forEach(button=>button.onclick=()=>{
      const view=button.dataset.stageView;
      panel.querySelectorAll('[data-stage-view]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
      panel.querySelectorAll('[data-stage-pane]').forEach(pane=>{
        pane.hidden=pane.dataset.stagePane!==view;
        if(pane.hidden)pane.querySelectorAll('video').forEach(video=>video.pause());
      });
    });
  };
  return projectCarousel($(tabId),panel,items.map(item=>item.title),render,
    isStage?{kind:'个大型活动',delay:10000}:{kind:'个商品屏',autoplay:false});
}
const stageCases=screenWork.onSite.filter(item=>item.id);
const pairedProductCases=screenWork.onSite.filter(item=>item.design.key.startsWith('d11-'));
const pairedProductKeys=new Set(pairedProductCases.map(item=>item.design.key));
const productCases=[
  ...pairedProductCases,
  ...screenWork.b.filter(item=>!pairedProductKeys.has(item.key)).map(item=>({
    title:item.title,
    note:item.note,
    design:{key:item.key,title:item.kind,video:item.video},
    materials:item.materials,
    materialsTitle:'静态效果稿'
  }))
];
const selectStage=mountScreenCases('screen-on-site-tabs','screen-on-site-panel',stageCases);
mountScreenCases('screen-product-tabs','screen-product-panel',productCases);
function mountScreen(group){
  const items=group.picks.map(key=>screenWork[group.key].find(item=>item.key===key));
  const section=document.createElement('section');
  const heading='screens-'+group.key;
  section.className='screen-grade';
  section.setAttribute('aria-labelledby',heading);
  section.innerHTML='<header class="screen-grade-head"><h4 id="'+heading+'">'+words(group.title)+'</h4></header>'+
    '<div class="screen-feature"></div><div class="screen-picks" role="group" aria-label="'+words(group.title)+'素材"></div>';
  $('screen-showcase').append(section);
  const player=section.querySelector('.screen-feature');
  const picks=section.querySelector('.screen-picks');
  picks.innerHTML=items.map(item=>'<button type="button" aria-pressed="false">'+screenThumb(item)+'</button>').join('');
  const buttons=[...picks.children];
  function select(index){
    const previous=player.querySelector('video');
    if(previous){screenObserver.unobserve(previous);previous.pause()}
    const item=items[index];
    section.classList.toggle('is-portrait',!!item.portrait);
    player.style.setProperty('--screen-ratio',item.ratio||'16 / 10');
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',i===index));
    const asset=item.video
      ?'<video controls muted loop playsinline preload="none" aria-label="'+words(item.title)+'" poster="'+src(item.key)+'" src="'+videoSrc(item.key)+'"></video>'
      :art([item.key,item.title,'','native']);
    player.innerHTML='<div class="screen-media">'+asset+'</div><div class="screen-caption"><h4>'+words(item.title)+'</h4><p>'+words(item.kind?item.kind+' · '+item.note:item.note)+'</p></div>';
    const video=player.querySelector('video');
    if(video)screenObserver.observe(video);
  }
  buttons.forEach((button,index)=>button.onclick=()=>{
    select(index);
    if(player.getBoundingClientRect().bottom<160) player.scrollIntoView({block:'start'});
  });
  select(0);
}
screenGroups.forEach(mountScreen);
const extras=screenWork.s.filter(item=>item.key==='motion-beacon');
$('screen-structure').innerHTML=art(['structure','屏体编号','点击放大查看屏体位置','native'],true);
const mockup=screenWork.proof.find(item=>item.key==='mockup');
$('screen-proof').innerHTML='<div class="screen-proof-grid">'+extras.map(item=>
  '<figure>'+screenAsset(item)+'<figcaption>'+words(item.title)+'</figcaption></figure>'
).join('')+screenGallery([mockup])+'</div>';
$('screen-product-library').innerHTML='<div class="screen-minis">'+screenGallery(screenWork.ref)+'</div>';

const grades=[
  {tab:'P1 · 第一梯队',groups:[
    {title:'阵仗视频',id:'cover-d11',items:[
      ['cover-rally-cards','《点将》','双十一 · 陈先生'],
      ['cover-xujie','《上场》','徐杰 · 双十一'],
      ['sword-cover','《剑成》','陈先生 · 亮剑回归'],
      ['cover-brand-gathering','《重点品牌集结》','品牌阵容'],
      ['p1-03','《618 品牌集结号》','618 品牌盛典'],
      ['cover-bridge','《桥梁》','品牌与团队'],
      ['cover-lineup-collage','《收官！全员备战》','多人物拼贴']
    ]},
    {title:'预热视频',items:[
      ['cover-fashion-show','《一场秀》','时装预热'],
      ['cover-fashion-sail','《启航 · 赴大秀之约》','秋冬时装秀'],
      ['cover-sn-lab','SN_LAB · 自然规律','发布会预告'],
      ['cover-chen-stage','《辛陈所向》','陈先生'],
      ['cover-preparations','《筹备全记录》','发布会幕后']
    ],series:{title:'618 收官倒计时',layout:'countdown-gallery',id:'cover-618',items:[
      ['p1-02','倒计时 3 天','暖色逆光'],
      ['p1-12','倒计时 2 天','白西装近景'],
      ['workflow-portrait-countdown','倒计时 1 天','红毯俯拍']
    ]}},
    {title:'人设视频',items:[
      ['cover-horse','《骏马迎春》','初瑞雪 · 开年人设'],
      ['cover-snow','《逆境中开花》','初瑞雪 · 人物传记'],
      ['cover-che-love','《澈爱》','人物特写'],
      ['cover-mentor','《最好的师娘》','徐婕与初瑞雪'],
      ['cover-another-life','《如果换一套人生》','女性群像'],
      ['cover-through-the-year','《走过这一年》','初瑞雪 · 年度回顾'],
      ['cover-midautumn-charity','《月满中秋，爱满人间》','中秋公益']
    ]},
    {title:'自述视频',items:[
      ['cover-founder-portrait','《我的创业史》','创业经历'],
      ['cover-origin','《我的起点》','回顾起点'],
      ['p1-04','《我们的 9 年》','九年回顾'],
      ['p1-06','《一封家书》','手写家书'],
      ['p1-01','《对谈》','双人访谈'],
      ['cover-xinxuan-story','《我在，辛选就在》','个人与品牌']
    ]},
    {title:'科普视频',items:[
      ['cover-bed-testing','辛选品控 · 实测慕思','床垫实测'],
      ['cover-linen','亚麻 · 为质感而生','面料讲解']
    ]}
  ]},
  {tab:'P2 · 福利品',groups:[
    {title:'补贴、赠品与低价',items:[
      ['p2-01','2 亿补贴','补贴金额'],
      ['cover-phone','免费送手机','赠品'],
      ['p2-04','1 块钱 · 层层豪礼','参与门槛'],
      ['p2-02','品牌送礼啦','品牌礼品'],
      ['cover-gift-fifty','五千万元礼物','群像福利'],
      ['cover-ruby','I DO · 顶级彩宝','珠宝福利']
    ]}
  ]},
  {tab:'P3 · 商品种草',groups:[
    {title:'产品卖点与上身效果',items:[
      ['p3-color-styling','高级感色彩穿搭','配色搭配'],
      ['p3-01','安热沙小金瓶','防晒'],
      ['p1-15','超前剧透 · 秀场 Look','上身搭配'],
      ['p3-10','老钱衬衫','衬衫上身'],
      ['p3-sea-cucumber','这一口海参，要过几关？','海参溯源'],
      ['p3-xiaodu-course','小度 · 顶级高思课','学习设备'],
      ['p3-night-skincare','晚间护肤','使用场景'],
      ['p3-freeze-dried','快手冻干女王','冻干护肤'],
      ['p3-calcium-iron-zinc','补前先认钙铁锌','营养饮品'],
      ['p3-02','出行霸主 · 大容量箱王','容量'],
      ['p2-06','他的大米，补贴 50 万斤','大米种草'],
      ['p3-03','一条牛仔裤的十种搭配','同款多搭']
    ]}
  ]},
  {tab:'P4 · 直播切片',groups:[
    {title:'之前的切片封面',layout:'clip-earlier',
      summary:'标题字形、描边和配色各异，价格与卖点位置不固定；缺少统一的活动框和会标，整组切片的系列感较弱。',
      items:[
        ['cover-collagen','博创 · 胶原直补'],
        ['clip-earlier-freeze-dried','博创次抛 · 补胶原神！'],
        ['clip-earlier-collagen-shape','紧致塑颜 · 用博创'],
        ['clip-earlier-fur','保暖保值 · 首选貂'],
        ['clip-earlier-winter','冬天的第一份温暖'],
        ['clip-earlier-fashion','冬装来看初瑞雪']
      ]},
    {title:'现在的切片封面',layout:'clip-current',
      summary:'统一活动框与底部会标，让切片形成同场盛典的系列识别。价格角标、品类标题与补充卖点各有固定位置，信息层级更清楚，也方便延展到不同商品。',
      items:[
        ['p4-01','三全 · 整箱囤'],
        ['p4-03','鲁润阿胶 · 常备送礼'],
        ['clip-final-lays','乐事 · 吃薯片找乐事']
      ]}
  ]}
];
let coverRailSerial=0;
function coverRail(items,title,layout='',eager=false,captions=true){
  const id='cover-rail-'+(++coverRailSerial);
  const controls='<div class="cover-rail-controls" role="group" aria-label="'+words(title)+'浏览控制">'+
    '<button type="button" data-cover-rail="'+id+'" data-direction="-1" aria-controls="'+id+'" aria-label="'+words(title)+'：向左浏览" disabled>←</button>'+
    '<button type="button" data-cover-rail="'+id+'" data-direction="1" aria-controls="'+id+'" aria-label="'+words(title)+'：向右浏览">→</button></div>';
  const cards=items.map((item,index)=>{
    if(captions)return art(item,eager&&index<4);
    const [key,name]=item;
    return '<figure class="shot"><button type="button" data-image="'+key+'" aria-label="放大查看 '+words(name)+'">'+
      '<img src="'+src(key)+'" alt="'+words(name)+'" loading="lazy" decoding="async"></button></figure>';
  }).join('');
  return {controls,content:'<div class="gallery '+(captions?'cover-grid':'clip-gallery')+' cover-carousel '+layout+'" id="'+id+'" tabindex="0" role="region" aria-label="'+words(title)+'封面画廊">'+cards+'</div>'};
}
function coverGroup({title,items,layout='',id,link,series},eager=false,heading='h3'){
  const rail=coverRail(items,title,layout,eager);
  return '<section class="cover-group"'+(id?' id="'+id+'"':'')+'><header class="cover-group-head"><'+heading+'>'+words(title)+'</'+heading+'>'+
    '<div class="cover-group-actions">'+(link?'<a class="case-link" href="#'+link[0]+'">'+words(link[1])+'</a>':'')+rail.controls+'</div></header>'+
    rail.content+(series?coverGroup(series,false,'h4'):'')+'</section>';
}
function syncCoverRails(){
  $('cover-panel').querySelectorAll('.cover-carousel').forEach(rail=>{
    rail.addEventListener('scroll',updateCoverRails,{passive:true});
  });
  requestAnimationFrame(updateCoverRails);
}
function updateCoverRails(){
  $('cover-panel').querySelectorAll('[data-cover-rail]').forEach(button=>{
    const rail=$(button.dataset.coverRail);
    const end=Math.max(0,rail.scrollWidth-rail.clientWidth);
    button.disabled=button.dataset.direction==='-1'?rail.scrollLeft<=2:rail.scrollLeft>=end-2;
  });
}
function moveCoverRail(rail,direction){
  const gap=parseFloat(getComputedStyle(rail).columnGap)||0;
  rail.scrollBy({left:direction*(rail.clientWidth+gap),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('cover-panel').addEventListener('click',event=>{
  const button=event.target.closest('[data-cover-rail]');
  if(button)moveCoverRail($(button.dataset.coverRail),Number(button.dataset.direction));
});
$('cover-panel').addEventListener('keydown',event=>{
  if(!event.target.matches('.cover-carousel'))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();moveCoverRail(event.target,event.key==='ArrowLeft'?-1:1);
  }
});
new ResizeObserver(updateCoverRails).observe($('cover-panel'));
const selectCover=tabs($('cover-tabs'),grades.map(grade=>grade.tab),index=>{
  const grade=grades[index];
  if(index===3){
    $('cover-panel').innerHTML='<section class="clip-comparison" id="clip-revisions" aria-label="之前与现在的直播切片封面对照">'+
      '<div class="clip-comparison-groups">'+grade.groups.map(group=>{
        const rail=coverRail(group.items,group.title,'',false,false);
        return '<section class="clip-group '+group.layout+'"><header class="cover-group-head"><h3>'+words(group.title)+'</h3>'+rail.controls+'</header>'+
          rail.content+'<p class="clip-summary">'+words(group.summary)+'</p></section>';
      }).join('')+'</div></section>';
  }else{
    $('cover-panel').innerHTML=grade.groups.map((group,i)=>coverGroup(group,i===0)).join('');
  }
  syncCoverRails();
});
function openLinkedCase(){
  const target=location.hash.slice(1);
  if(target==='list-upgrade'||target==='cover-revisions'){
    $(target).open=true;
    requestAnimationFrame(()=>$(target).scrollIntoView());
    return;
  }
  if(target==='clip-revisions'){
    if(!$(target))selectCover(3);
    requestAnimationFrame(()=>$(target).scrollIntoView());
    return;
  }
  const stageIndex=stageCases.findIndex(item=>item.id===target);
  const isCover=target==='cover-d11'||target==='cover-618';
  if(stageIndex<0&&!isCover)return;
  if(!$(target)){
    if(isCover)selectCover(0);
    else selectStage(stageIndex);
  }
  requestAnimationFrame(()=>$(target)?.scrollIntoView());
}
window.addEventListener('hashchange',openLinkedCase);
openLinkedCase();

const coverRevisions=[
  ['早期封面 · 问题','revision-earlier',[
    ['old-cover-0','818 · 召你回归','群像铺满画面，主播不够突出。'],
    ['old-cover-2','双十一 · 为行业而战','舞台、观众和金字挤在人物周围。'],
    ['old-cover-5','《品牌全明星》','前排被大标题挡住，后排融进红幕。'],
    ['old-cover-1','《感恩》','光斑和金字盖住了故事场景。'],
    ['old-cover-6','《欢迎回家》','右侧照片太多，分散主角的焦点。'],
    ['old-cover-7','《我何止是》','大字和红色光轨压过了人物。']
  ]],
  ['新版封面 · 改法','revision-current',[
    ['cover-snow','《逆境中开花》','上半幅用舞台肖像立住人物，下半幅用打包场景交代起点。'],
    ['cover-xujie','《上场》','用近景突出主角，标题避开面部。'],
    ['p1-03','《618 品牌集结号》','标题放在上方，给主角和分层站位的品牌阵容留出空间。'],
    ['p1-04','《我们的 9 年》','用上下两段场景讲清人物的今昔关系。'],
    ['cover-clothing-character','《见衣识人》','主角清晰，后排用动态虚化保留走秀氛围。'],
    ['cover-che-love','《澈爱》','收暗背景，聚光留给人像和片名。']
  ]]
];
$('cover-revision-groups').innerHTML=coverRevisions.map(([title,style,items])=>
  '<section class="cover-revision '+style+'"><h3>'+words(title)+'</h3>'+
  gallery(items,'gallery cover-revision-grid')+'</section>').join('');
const workflows=[
 ['字样设计','三种路径：文生字、带参考生成、字形结构参考。生成后在 PS 修整字形与边缘。',[['horse-type','主题字样'],['letters','活动金色字样','','wide'],['gold-type','活动落版字样','','wide']]],
 ['人物光影','618 收官预热',[
   ['workflow-portrait-source','01 人物素材','保留主角的白西装'],
   ['workflow-portrait-reference','02 俯拍参考','用人流虚化突出主角'],
   ['workflow-portrait-carpet','03 红毯初稿','将主角放进俯拍红毯']
 ],{
   shirt:['workflow-portrait-shirt','换衣参考','红色「挑战」T 恤'],
   revised:['workflow-portrait-color','换衣后','部分路人换成红衣，主角保留白西装'],
   result:['workflow-portrait-countdown','05 倒计时版式','加入倒计时标题和聚光']
 }],
 ['分层交付','屏幕先对齐屏体与动态背景，封面另存可替换的标题图层。',[['day-text','倒计时透明字层'],['p1-02','合成封面'],['chess','活动屏幕设计稿','','wide']]]
];
tabs($('work-tabs'),workflows.map(w=>w[0]),i=>{
  const [title,note,items,portrait]=workflows[i];
  const content=portrait
    ?'<div class="portrait-process"><div class="portrait-sequence">'+gallery(items,'gallery portrait-steps')+
      '<section class="portrait-wardrobe"><h4>04 局部换衣</h4><div class="portrait-wardrobe-pair">'+
      art(portrait.shirt)+'<span class="portrait-arrow" aria-hidden="true">→</span>'+art(portrait.revised)+
      '</div></section></div>'+art(portrait.result)+'</div>'
    :gallery(items,'work-row');
  $('work-panel').innerHTML='<div class="panel"><h3>'+words(title)+'</h3><p>'+words(note)+'</p>'+content+'</div>';
});

const viewer=$('viewer');
let pausedScreenVideos=[];
function refreshCycles(){
  
  projectCarouselRefreshers.forEach(refresh=>refresh());
}
function openViewer(content){
  $('viewer-content').innerHTML=content;
  pausedScreenVideos=[...document.querySelectorAll('.screen-feature video, .screen-case video, .screen-extra video')].filter(video=>!video.paused);
  pausedScreenVideos.forEach(video=>video.pause());
  viewer.showModal();
  refreshCycles();
}
function openVideo(videoId,start){
  const project=films.find(f=>f.video===videoId);
  if(!project && videoId!=='screen-motion')return;
  const title=project?'《'+project.title+'》':'双十一 · 象棋分屏动效';
  const poster=project?' poster="'+src(project.frames[0][0])+'"':'';
  const offset=Number.isFinite(start)&&start>0?'#t='+start:'';
  openViewer('<video controls playsinline preload="metadata" src="'+videoSrc(videoId)+offset+'"'+poster+'></video><p>'+words(title)+'</p>');
  viewer.querySelector('video').play().catch(()=>{});
}
document.addEventListener('click',event=>{
  const sourceScale=event.target.closest('[data-source-scale]');
  if(sourceScale){const stage=viewer.querySelector('.source-board-stage');const enlarged=stage.classList.toggle('is-enlarged');sourceScale.setAttribute('aria-pressed',String(enlarged));sourceScale.textContent=enlarged?'适合屏幕':'放大细节';return;}
  const board=event.target.closest('[data-source-board]');
  if(board){
    const background=board.querySelector('.overview-background');
    const image=board.querySelector('img');
    const artwork=background
      ?background.outerHTML.replace(' id="overview-background-copy"','')
      :'<img src="'+image.getAttribute('src')+'" alt="'+words(image.alt)+'">';
    openViewer('<div class="source-board-tools"><button type="button" data-source-scale aria-pressed="false">放大细节</button></div>'+
      '<div class="source-board-stage" tabindex="0">'+artwork+'</div>');
    return;
  }
  const video=event.target.closest('[data-video]');
  if(video){openVideo(video.dataset.video,Number(video.dataset.start));return}
  const trigger=event.target.closest('[data-image]');
  if(!trigger)return;
  const image=trigger.querySelector('img');
  openViewer('<img src="'+image.getAttribute('src')+'" alt="'+words(image.alt)+'"><p>'+words(image.alt)+'</p>');
});
viewer.querySelector('.close').onclick=()=>viewer.close();
viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close()});
viewer.addEventListener('close',()=>{
  $('viewer-content').replaceChildren();
  refreshCycles();
  pausedScreenVideos.forEach(video=>{
    const bounds=video.getBoundingClientRect();
    if(video.isConnected && bounds.bottom>0 && bounds.top<innerHeight) video.play().catch(()=>{});
  });
  pausedScreenVideos=[];
});
document.addEventListener('visibilitychange',refreshCycles);
// One reading-position calculation owns the active chapter, including layout changes.
const navigationSections=['overview','film','campaigns','covers','list-upgrade','workflow'].map($);
const navigationLinks=[...document.querySelectorAll('.top nav a')];
let navigationFrame=0,currentNavigation='';
function updateNavigation(){
  navigationFrame=0;
  const readingLine=Math.max(document.querySelector('.top').getBoundingClientRect().bottom+24,innerHeight*.25);
  let active='';
  for(const section of navigationSections){if(section.getBoundingClientRect().top<=readingLine)active=section.id;else break}
  const gradeLinks=[...document.querySelectorAll('.screen-grade-index a')];
  let grade='';
  if(active==='campaigns')for(const id of ['screen-l1','screen-l2','screen-l3']){if($(id).getBoundingClientRect().top<=readingLine)grade=id;else break}
  gradeLinks.forEach(link=>{if(link.hash==='#'+grade)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
  if(active===currentNavigation)return;
  currentNavigation=active;
  navigationLinks.forEach(link=>{
    const selected=link.hash==='#'+active;
    link.classList.toggle('current',selected);
    if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  const selected=navigationLinks.find(link=>link.hash==='#'+active);
  if(selected){
    const nav=selected.parentElement,box=nav.getBoundingClientRect(),item=selected.getBoundingClientRect();
    if(item.left<box.left)nav.scrollBy({left:item.left-box.left-6,behavior:'instant'});
    else if(item.right>box.right)nav.scrollBy({left:item.right-box.right+6,behavior:'instant'});
  }
}
function scheduleNavigation(){if(!navigationFrame)navigationFrame=requestAnimationFrame(updateNavigation)}
addEventListener('scroll',scheduleNavigation,{passive:true});
addEventListener('resize',scheduleNavigation,{passive:true});
addEventListener('hashchange',scheduleNavigation);
new ResizeObserver(scheduleNavigation).observe($('main'));
document.fonts.ready.then(scheduleNavigation);
scheduleNavigation();
