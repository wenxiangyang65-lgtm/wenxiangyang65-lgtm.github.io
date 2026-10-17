/* Five folders share the original spring fan, media player and project destinations. */
window.createPortfolioDirectory=function({projects,filmPreview,reduced,onSuppressClick}) {
 const groups=[
  {id:'integrated',name:'品牌整合与营销设计',short:'整合营销',en:'INTEGRATED CAMPAIGNS',note:'创意策略、视觉系统与线上线下落地'},
  {id:'film',name:'品牌影像与内容设计',short:'品牌影像',en:'BRAND FILMS',note:'人物叙事、AIGC 短片与成片制作'},
  {id:'operations',name:'运营视觉与节点传播',short:'运营视觉',en:'CAMPAIGN & COMMUNICATION',note:'活动邀请、商品海报与日常营销传播'},
  {id:'ip',name:'品牌 IP 与三维设计',short:'IP 与三维',en:'IP & 3D DESIGN',note:'角色识别、造型材质与应用延展'},
  {id:'explore',name:'个人设计探索',short:'设计探索',en:'VISUAL EXPLORATION',note:'插画、字体、潮流角色与个人三维'}
 ];
 const root=document.querySelector('#catalog-folders'),escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const items=projects.flatMap(parent=>(parent.catalogItems||[]).map(item=>({...item,parent}))),folders=new Map(),storageKey='portfolio-category-directory';
 let active=null,restoring=false,opener=null;
 function remember(item=null){if(restoring)return;try{sessionStorage.setItem(storageKey,JSON.stringify({open:active,item:item?.id||null,y:window.scrollY}));const folder=folders.get(active);if(folder?.motion)folder.motion.rememberDirectory(item?.id||folder.motion.getCurrent()?.slug)}catch{}}
 function entry(item){const native=item.id===item.parent.slug;return {...item.parent,...item,slug:item.id,cover:native?item.parent.cover:item.image,template:native?item.parent.template:'sleeve',label:item.title,n:items.indexOf(item)+1,category:groups.find(g=>g.id===item.group).short,year:String(item.year).includes('个人')?'2023—2026':item.year,films:item.filmFirst?item.parent.films:null}}
 function recordMarkup(p){
  if(p.template==='original')return `<img class="record-image" src="${escape(p.card)}" alt="${escape(p.title)}的原版唱片封面" width="418" height="360" draggable="false">${p.spin?`<span class="record-disc"><img src="${escape(p.cover)}" alt="" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><img class="record-tab" src="${escape(p.tab)}" alt="" draggable="false">`:''}`;
  return `<img class="record-image" src="assets/record-sleeve.webp" alt="" width="418" height="360" draggable="false"><span class="record-disc"><img src="${escape(p.cover)}" alt="${escape(p.title)}的项目封面" draggable="false"><i class="record-hole"></i><i class="record-glint"></i></span><span class="new-tab"></span><span class="record-title" style="font-size:${Math.min(5.45,70/[...p.title].length)}cqw">${escape(p.title)}</span><span class="record-role">${p.id===p.parent.slug?'【项目角色】':'【作品方向】'}<b>${p.id===p.parent.slug?'主设＆主创':escape(p.tags[0])}</b></span><span class="record-number">${String(p.n).padStart(2,'0')}</span><span class="record-year">${escape(p.year)}</span><span class="record-category">${escape(p.category)}</span>`;
 }
 function openProject(event,item,record){
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();if(performance.now()<window.portfolioSuppressClickUntil)return;
  opener=folders.get(active)?.motion?.selectProject(item.id)||record;if(location.hash!=='#catalog')history.replaceState(history.state,'','#catalog');remember(item);const p=entry(item);if(filmPreview.open(p,opener))return;
  if(reduced.matches){location.href=item.entry;return}document.querySelector('.transition-curtain img').src=p.cover;document.body.classList.add('is-opening');setTimeout(()=>location.href=item.entry,180);
 }
 function build(folder){
  const {panel,list,group}=folder;const operations=group.id==='operations';if(operations)panel.classList.add('folder-operations');panel.innerHTML=`<header class="folder-panel-heading"><div><h3>${escape(group.name)}</h3><p>${list.length} 组作品 · ${escape(group.note)}</p></div><button class="folder-close" type="button" aria-label="收起${escape(group.name)}">收起分类 <span aria-hidden="true">×</span></button></header><div class="folder-stage"><div class="albums${list.length<3?' small-records':''}" aria-label="${escape(group.name)}唱片目录" tabindex="0"></div></div><div class="folder-controls"><button class="album-button folder-previous" type="button" aria-label="上一个${group.short}项目">上一项</button><div class="track-control"><div class="selection-label"><span class="selection-title"></span><span class="page-count"></span></div><p class="selection-summary"></p><div class="selection-tags"></div><input class="album-range" type="range" min="0" max="1" step="0.001" value="0" aria-label="横向浏览${escape(group.name)}唱片"><span class="directory-hint">上下滚轮 · 左右滑动 · 点击唱片${list.some(i=>i.filmFirst)?'先看成片':'进入项目'}</span></div><button class="album-button folder-next" type="button" aria-label="下一个${group.short}项目">下一项</button><button class="album-button folder-motion" type="button" aria-pressed="true">自动播放</button></div>`;
  panel.querySelector('.folder-close').addEventListener('click',()=>{toggle(group.id);folder.button.focus({preventScroll:true});folder.section.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'})});
  if(operations){const index=document.createElement('nav');index.className='operations-index';index.setAttribute('aria-label','运营视觉作品索引');index.innerHTML=list.map((item,i)=>`<button type="button" data-item="${escape(item.id)}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span><span>${escape(item.title)}</span></button>`).join('');const worklist=document.createElement('details');worklist.className='operations-worklist';worklist.open=!matchMedia('(max-width:520px)').matches;worklist.innerHTML='<summary>作品清单 · 11 组 <span aria-hidden="true">＋</span></summary>';worklist.append(index);panel.querySelector('.folder-panel-heading').after(worklist);const detail=panel.querySelector('.track-control');detail.insertAdjacentHTML('beforeend','<div class="selection-entry"><span class="selection-source"></span><a class="selection-open">查看这组作品 ↗</a></div>');index.addEventListener('click',event=>{const button=event.target.closest('button[data-item]');if(button)folder.motion?.selectProject(button.dataset.item)});}
  const albums=panel.querySelector('.albums'),title=panel.querySelector('.selection-title'),count=panel.querySelector('.page-count'),range=panel.querySelector('.album-range'),previous=panel.querySelector('.folder-previous'),next=panel.querySelector('.folder-next'),catalogMotion=panel.querySelector('.folder-motion');
  const views=list.map((item,i)=>{const view=entry(item);if(operations)view.n=i+1;return view}),small=list.length<3;
  for(let cycle=small?0:-1;cycle<= (small?0:1);cycle++){
   const page=document.createElement('div');page.className='album-page';page.dataset.cycle=cycle;if(cycle!==0)page.setAttribute('aria-hidden','true');
   views.forEach((p,i)=>{const a=document.createElement('a');a.className='record';a.href=p.entry;a.dataset.project=p.id;a.dataset.order=i;a.setAttribute('aria-label',p.title+(p.films?.length?'，先观看成片':'，查看项目详情'));if(p.films?.length)a.setAttribute('aria-haspopup','dialog');if(cycle!==0)a.tabIndex=-1;a.style.setProperty('--disc-x',`${p.x||13.16}%`);a.style.setProperty('--disc-y',`${p.y||5.84}%`);a.style.setProperty('--disc-size',`${p.size||75.12}%`);a.innerHTML=recordMarkup(p);a.addEventListener('click',e=>openProject(e,list[i],a));if(matchMedia('(hover:hover) and (pointer:fine)').matches){a.addEventListener('pointermove',e=>{const r=a.getBoundingClientRect();a.style.setProperty('--record-angle',`${(e.clientX-r.left)/r.width*8-4}deg`)});a.addEventListener('pointerleave',()=>a.style.removeProperty('--record-angle'))}page.append(a);if(small){const caption=document.createElement('span');caption.className='small-record-label';caption.textContent=p.title;a.append(caption)}});albums.append(page);
  }
  function select(p,i){if(operations){for(const button of panel.querySelectorAll('.operations-index button'))button.setAttribute('aria-pressed',String(button.dataset.item===p.id));const link=panel.querySelector('.selection-open');link.href=p.entry;link.setAttribute('aria-label','查看'+p.title+'，定位到对应原稿章节');link.onclick=event=>openProject(event,list[i],panel.querySelector('.record[data-project="'+p.id+'"]'));panel.querySelector('.selection-source').textContent=p.parent.title+' · 对应原稿章节';}title.textContent=p.title;count.textContent=`${String(i+1).padStart(2,'0')} / ${list.length}`;panel.querySelector('.selection-summary').textContent=p.summary;panel.querySelector('.selection-tags').replaceChildren(...p.tags.map(t=>{const span=document.createElement('span');span.textContent=t;return span}));}
  select(views[0],0);
  if(!small){folder.motion=window.createPortfolioCatalogMotion({albums,range,previous,next,catalogMotion,projects:views,reduced,onSuppressClick,title,count,storageKey:'portfolio-category-motion-'+group.id,onSelectionChange:select})}
  else {panel.classList.add('folder-small');title.textContent='两个项目 · 品牌 IP 与三维表达';count.textContent='02 组作品';panel.querySelector('.directory-hint').textContent='点击唱片 · 查看对应作品';}
  folder.built=true;
 }
 function placePanel(folder){
  // Keep the original reading order and expand beneath the selected visual row.
  const focused=folder.panel.contains(document.activeElement)?document.activeElement:null;
  folder.panel.hidden=true;
  const rowTop=folder.section.offsetTop;
  const row=[...folders.values()].filter(f=>Math.abs(f.section.offsetTop-rowTop)<2);
  const end=row.at(-1)?.section||folder.section;
  end.after(folder.panel);folder.panel.hidden=false;focused?.focus({preventScroll:true});
 }
 function toggle(id,{restore=false}={}){
  const old=folders.get(active);if(old){old.motion?.setActive(false);old.panel.hidden=true;old.button.setAttribute('aria-expanded','false');old.section.classList.remove('is-open')}
  if(active===id&&!restore){active=null;remember();return}
  active=id;const folder=folders.get(id);if(!folder){active=null;return}
  placePanel(folder);folder.button.setAttribute('aria-expanded','true');folder.section.classList.add('is-open');if(!folder.built)build(folder);else folder.motion?.setActive(true);
  if(!restore){folder.panel.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});remember()}
 }
 for(const [i,group] of groups.entries()){
  const list=items.filter(item=>item.group===group.id),section=document.createElement('section');section.className='catalog-folder';section.dataset.category=group.id;
  const thumbs=list.slice(0,3).map(item=>{const p=entry(item),fromCard=p.cover.split('?')[0]===p.card?.split('?')[0];return `<span class="folder-mini-disc${fromCard?' from-card':''}"><img src="${escape(p.cover)}" alt="" loading="lazy" draggable="false"></span>`}).join('');
  section.innerHTML=`<h3><button type="button" class="folder-toggle" id="folder-${group.id}" aria-expanded="false" aria-controls="panel-${group.id}"><span class="folder-code">${String(i+1).padStart(2,'0')} / ${escape(group.en)}</span><span class="folder-mini" aria-hidden="true">${thumbs}</span><span class="folder-copy"><span class="folder-title"><strong>${group.name}</strong><span>${group.note}</span></span><span class="folder-count">${String(list.length).padStart(2,'0')}<span>组作品</span></span></span></button></h3>`;
  const button=section.querySelector('button'),panel=document.createElement('div');panel.className='catalog-panel';panel.id='panel-'+group.id;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','folder-'+group.id);panel.hidden=true;
  button.addEventListener('click',()=>toggle(group.id));root.append(section,panel);folders.set(group.id,{section,button,panel,list,group,built:false,motion:null});
 }
 document.querySelector('#directory-total').textContent=`${String(groups.length).padStart(2,'0')} DIRECTIONS / ${items.length} WORKS`;
 root.addEventListener('keydown',event=>{
  if(!event.target.classList.contains('folder-toggle'))return;
  const buttons=[...root.querySelectorAll('.folder-toggle')],i=buttons.indexOf(event.target);let next;
  if(event.key==='ArrowRight')next=(i+1)%buttons.length;
  else if(event.key==='ArrowLeft')next=(i+buttons.length-1)%buttons.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=buttons.length-1;
  else if(event.key==='ArrowUp'||event.key==='ArrowDown'){
   const current=buttons[i].getBoundingClientRect(),direction=event.key==='ArrowDown'?1:-1;
   const candidates=buttons.map((button,index)=>({index,r:button.getBoundingClientRect()})).filter(v=>(v.r.top-current.top)*direction>4);
   candidates.sort((a,b)=>Math.abs(a.r.top-current.top)-Math.abs(b.r.top-current.top)||Math.abs(a.r.left+a.r.width/2-current.left-current.width/2)-Math.abs(b.r.left+b.r.width/2-current.left-current.width/2));next=candidates[0]?.index;
  }else return;
  event.preventDefault();if(next!==undefined)buttons[next].focus();
 });
 let resizeFrame=0;
 window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{const folder=folders.get(active);if(folder){placePanel(folder);folder.motion?.setActive(true)}})});
 function restore(){document.body.classList.remove('is-opening');if(location.hash!=='#catalog')return;let state;try{state=JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{}if(!state?.open||!folders.has(state.open))return;restoring=true;toggle(state.open,{restore:true});requestAnimationFrame(()=>requestAnimationFrame(()=>{folders.get(state.open).motion?.restoreDirectory();window.scrollTo({top:state.y||0,behavior:'instant'});restoring=false}));}
 window.addEventListener('pageshow',event=>{if(event.persisted){const d=document.querySelector('#catalog-film-dialog');if(d.open)d.close()}restore()});restore();
 return {rememberCurrent(){remember()},getActive(){return active},opener:()=>opener};
};
