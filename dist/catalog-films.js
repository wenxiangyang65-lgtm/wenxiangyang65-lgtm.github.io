/* Open finished AI films directly from the catalog; project links remain available. */
window.createPortfolioFilmPreview=function({onOpen,onClose}) {
 const dialog=document.querySelector('#catalog-film-dialog'),video=document.querySelector('#catalog-film-video');
 const title=document.querySelector('#catalog-film-title'),detail=document.querySelector('#catalog-film-detail');
 const variants=document.querySelector('#catalog-film-variants'),status=document.querySelector('#catalog-film-status');
 const sound=document.querySelector('#catalog-film-sound'),retry=document.querySelector('#catalog-film-retry');
 let opener=null,project=null,revision=0,scrollPosition=0;
 function message(text='',play=false){status.textContent=text;status.hidden=!text;retry.hidden=!play}
 function play(){
  const attempt=revision;
  video.play().catch(async error=>{
   if(attempt!==revision||!dialog.open)return;
   if(error.name==='NotAllowedError'&&!video.muted){
    video.muted=true;sound.hidden=false;
    try{await video.play();return}catch{}
   }
   if(attempt===revision&&dialog.open)message('点击播放按钮观看完整影片。',true);
  });
 }
 function selectFilm(index){
  const film=project.films[index];revision++;video.pause();message('正在载入影片…');sound.hidden=true;
  video.muted=false;video.poster=film.poster||project.cover;video.src=film.src;video.load();
  variants.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  video.setAttribute('aria-label',project.title+' · '+film.label);play();
 }
 function open(p,element){
  if(!p.films?.length)return false;
  opener=element;project=p;scrollPosition=window.scrollY;title.textContent=p.title;detail.href=p.entry;
  variants.replaceChildren();variants.hidden=p.films.length<2;
  p.films.forEach((film,index)=>{const button=document.createElement('button');button.type='button';button.textContent=film.label;button.addEventListener('click',()=>selectFilm(index));variants.append(button)});
  onOpen();document.body.classList.add('film-preview-open');dialog.showModal();selectFilm(0);
  return true;
 }
 document.querySelector('#catalog-film-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{
  revision++;video.pause();video.removeAttribute('src');video.load();message();sound.hidden=true;
  document.body.classList.remove('film-preview-open');onClose();window.scrollTo({top:scrollPosition,behavior:'instant'});opener?.focus({preventScroll:true});
 });
 detail.addEventListener('click',()=>{video.pause();revision++;});
 retry.addEventListener('click',()=>{if(video.error)video.load();play()});
 sound.addEventListener('click',()=>{video.muted=false;sound.hidden=true;play()});
 video.addEventListener('playing',()=>message());
 video.addEventListener('error',()=>{if(dialog.open&&video.getAttribute('src'))message('影片暂时无法播放，请重试或查看项目详情。',true)});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
 return {open};
};
