/* A spring-driven fan of the original project records. No artwork is transformed separately. */
window.createPortfolioCatalogMotion=function({albums,range,previous,next,catalogMotion,projects,reduced,onSuppressClick}) {
 const title=document.querySelector('#selected-title'),count=document.querySelector('#page-count');
 const records=[...albums.querySelectorAll('.record')];
 const states=records.map(record=>({record,center:0,y:0,angle:0,scale:1,vy:0,va:0,vs:0,visible:false}));
 let origin=0,cycle=0,pitch=0,position=0,target=0,velocity=0,last=0,ready=false;
 let visible=false,hovered=false,focused=false,drag=null,nativeTouch=false,paused=true,filmOpen=false;
 let holdUntil=0,autoAt=0,snapTimer=0,writingScroll=false;
 let wheelPageY=null,wheelActiveUntil=0;
 const wrapValue=value=>((value%cycle)+cycle)%cycle;
 const fraction=()=>cycle?wrapValue(position-origin)/cycle:0;
 const index=()=>cycle?Math.round(wrapValue(position-origin)/pitch)%projects.length:0;
 function controls() {
  if(!ready)return;
  const i=index();range.value=Math.min(1,wrapValue(position-origin)/Math.max(pitch,cycle-pitch));
  title.textContent=projects[i].title;count.textContent=`${String(i+1).padStart(2,'0')} / ${projects.length}`;
 }
 function hold(ms=4500){holdUntil=performance.now()+ms;autoAt=holdUntil+2600}
 function stopSpring(){position=albums.scrollLeft;target=position;velocity=0}
 function writeScroll(){
  writingScroll=true;albums.scrollLeft=position;writingScroll=false;
  // Wheel scrubbing belongs to this gallery, including browsers that move an ancestor during a nested scroll.
  if(wheelPageY!==null&&performance.now()<wheelActiveUntil&&Math.abs(window.scrollY-wheelPageY)>.5)window.scrollTo({top:wheelPageY,behavior:'instant'});
 }
 function normalize(){
  while(position>=origin+cycle){position-=cycle;target-=cycle}
  while(position<origin){position+=cycle;target+=cycle}
 }
 function measure() {
  const old=ready?fraction():0,groups=albums.children;
  if(groups.length<3)return;
  const first=groups[1].children[0];
  const nextCycle=groups[1].offsetLeft-groups[0].offsetLeft,nextPitch=nextCycle/projects.length;
  if(nextCycle<=0||nextPitch<=0)return;
  cycle=nextCycle;pitch=nextPitch;origin=first.offsetLeft+first.offsetWidth/2-albums.clientWidth/2;
  for(const s of states){s.center=s.record.offsetLeft+s.record.offsetWidth/2;s.visible=false}
  position=origin+old*cycle;target=position;velocity=0;ready=true;writeScroll();controls();render(1/60,true);
 }
 function spring(s,key,vkey,goal,dt,stiffness=145,damping=20){
  s[vkey]+=(stiffness*(goal-s[key])-damping*s[vkey])*dt;s[key]+=s[vkey]*dt;
 }
 function render(dt,instant=false) {
  const center=position+albums.clientWidth/2;
  for(const s of states){
   const d=(s.center-center)/pitch,abs=Math.abs(d),inView=abs<3.8;
   if(!inView){if(s.visible)s.record.style.visibility='hidden';s.visible=false;continue}
   const y=Math.pow(abs,1.65)*18,angle=Math.max(-32,Math.min(32,d*13)),scale=1-Math.min(.16,abs*.052)+.105*Math.exp(-abs*abs*3.2);
   if(instant||!s.visible||reduced.matches){s.y=y;s.angle=angle;s.scale=scale;s.vy=s.va=s.vs=0}
   else {spring(s,'y','vy',y,dt);spring(s,'angle','va',angle,dt);spring(s,'scale','vs',scale,dt,180,23)}
   if(!s.visible)s.record.style.visibility='visible';s.visible=true;
   s.record.style.setProperty('--fan-y',`${s.y.toFixed(2)}px`);
   s.record.style.setProperty('--fan-angle',`${s.angle.toFixed(3)}deg`);
   s.record.style.setProperty('--fan-scale',s.scale.toFixed(4));
   s.record.style.zIndex=String(50-Math.round(abs*10));
   s.record.classList.toggle('is-current',abs<.45);
  }
 }
 function go(value,manual=true){
  if(!ready)return;if(manual)hold();nativeTouch=false;clearTimeout(snapTimer);
  target=value;if(reduced.matches){position=target;normalize();writeScroll();render(1/60,true);controls()}
 }
 function move(direction){go(origin+Math.round((target-origin)/pitch)*pitch+direction*pitch)}
 function snap(fromTarget=false){if(!ready||drag)return;nativeTouch=false;go(origin+Math.round(((fromTarget?target:position)-origin)/pitch)*pitch)}
 function scheduleSnap(fromTarget=false){clearTimeout(snapTimer);snapTimer=setTimeout(()=>snap(fromTarget),170)}
 function frame(time){
  const dt=last?Math.min(.024,(time-last)/1000):1/60;last=time;
  if(ready&&visible&&!document.hidden){
   if(!filmOpen&&!paused&&!hovered&&!focused&&!drag&&!nativeTouch&&time>holdUntil&&time>autoAt){
    go(origin+(Math.round((target-origin)/pitch)+1)*pitch,false);autoAt=time+2900;
   }
   if(!drag?.active&&!nativeTouch){
    velocity+=(135*(target-position)-14.5*velocity)*dt;position+=velocity*dt;
    if(Math.abs(target-position)<.08&&Math.abs(velocity)<.25){position=target;velocity=0}
    normalize();writeScroll();
   }
   render(dt);controls();
  }
  requestAnimationFrame(frame);
 }
 albums.addEventListener('scroll',()=>{
  if(!ready||writingScroll)return;
  // Native touch scrolling owns the camera until its momentum finishes.
  if(nativeTouch){position=albums.scrollLeft;target=position;velocity=0;hold();if(!drag)scheduleSnap()}
  controls();
 },{passive:true});
 albums.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true});
 albums.addEventListener('pointerleave',()=>{hovered=false;wheelPageY=null;hold(300)});
 albums.addEventListener('focusin',e=>{
  focused=true;
  const record=e.target.closest('.record'),state=states.find(s=>s.record===record);
  if(state)go(state.center-albums.clientWidth/2);
 });
 albums.addEventListener('focusout',()=>{focused=albums.contains(document.activeElement);hold(300)});
 albums.addEventListener('wheel',e=>{
  if(!ready||e.ctrlKey||e.metaKey||drag)return;
  const unit=e.deltaMode===1?16:e.deltaMode===2?albums.clientHeight:1;
  const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*unit;
  if(!Number.isFinite(delta)||delta===0)return;
  if(wheelPageY===null||performance.now()>wheelActiveUntil)wheelPageY=window.scrollY;
  wheelActiveUntil=performance.now()+1600;
  e.preventDefault();paused=true;updateMotion();
  go(target+Math.max(-pitch*2,Math.min(pitch*2,delta*1.1)));scheduleSnap(true);
 },{passive:false});
 document.addEventListener('wheel',e=>{if(!albums.contains(e.target))wheelPageY=null},{capture:true,passive:true});
 document.addEventListener('keydown',()=>{wheelPageY=null});
 albums.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;wheelPageY=null;hold();clearTimeout(snapTimer);stopSpring();
  drag={id:e.pointerId,type:e.pointerType,x:e.clientX,y:e.clientY,start:position,active:false};
  nativeTouch=e.pointerType!=='mouse';
 });
 albums.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id||drag.type!=='mouse')return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.active&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)){drag.active=true;albums.setPointerCapture(e.pointerId);albums.classList.add('is-dragging')}
  if(drag.active){e.preventDefault();position=drag.start-dx;target=position;writeScroll()}
 });
 function finishDrag(e){
  if(!drag||e&&e.pointerId!==drag.id)return;
  const wasMouse=drag.type==='mouse';
  if(drag.active){onSuppressClick(performance.now()+350);albums.classList.remove('is-dragging')}
  drag=null;hold();if(wasMouse)snap();else scheduleSnap();
 }
 albums.addEventListener('pointerup',finishDrag);albums.addEventListener('pointercancel',finishDrag);
 document.addEventListener('pointerup',finishDrag);albums.addEventListener('dragstart',e=>e.preventDefault());
 albums.addEventListener('keydown',e=>{if(e.target===albums&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 range.addEventListener('input',()=>go(origin+Number(range.value)*(cycle-pitch)));
 range.addEventListener('change',()=>go(origin+Math.round((target-origin)/pitch)*pitch));
 previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 function updateMotion(){catalogMotion.textContent=paused?'自动播放':'暂停播放';catalogMotion.setAttribute('aria-pressed',String(paused));catalogMotion.setAttribute('aria-label',paused?'开启项目自动播放':'暂停项目自动播放')}
 catalogMotion.addEventListener('click',()=>{paused=!paused;hold(0);updateMotion()});
 reduced.addEventListener('change',()=>{paused=true;velocity=0;go(target,false);updateMotion()});
 function rememberDirectory(slug){try{sessionStorage.setItem('portfolio-directory',JSON.stringify({fraction:fraction(),slug,mode:'scroll-spring',paused}))}catch{}}
 function restoreDirectory(){
  document.body.classList.remove('is-opening');if(location.hash!=='#catalog'||!ready)return;
  let state;try{state=JSON.parse(sessionStorage.getItem('portfolio-directory')||'null')}catch{}
  if(state){const i=projects.findIndex(p=>p.slug===state.slug);position=origin+(['spring','scroll-spring'].includes(state.mode)?state.fraction*cycle:Math.max(0,i)*pitch);target=position;velocity=0;writeScroll();hold(6000);render(1/60,true);controls();if(i>=0)title.textContent=projects[i].title;if(state.mode==='scroll-spring'&&typeof state.paused==='boolean'){paused=state.paused||reduced.matches;updateMotion()}}
 }
 new ResizeObserver(measure).observe(albums);
 new IntersectionObserver(entries=>{const wasVisible=visible;visible=entries[0].isIntersecting;if(visible&&!wasVisible){autoAt=performance.now()+2900;render(1/60,true)}},{threshold:.12}).observe(albums);
 window.addEventListener('pageshow',restoreDirectory);window.addEventListener('hashchange',restoreDirectory);
 window.addEventListener('portfolio-film-open',()=>{filmOpen=true});window.addEventListener('portfolio-film-close',()=>{filmOpen=false;hold()});
 measure();updateMotion();requestAnimationFrame(frame);
 return {rememberDirectory,restoreDirectory};
};
