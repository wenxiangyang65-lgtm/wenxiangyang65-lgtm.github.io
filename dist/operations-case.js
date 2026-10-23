(()=>{
'use strict';
const STATIC=new URLSearchParams(location.search).has('static');
document.documentElement.classList.toggle('static',STATIC);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),videos=[...document.querySelectorAll('video')];
const dialog=document.querySelector('.art-dialog'),stage=dialog.querySelector('.dialog-stage'),image=document.getElementById('art-image'),zoom=document.getElementById('art-zoom');
let lastZoom=null;
function syncVideo(v){
 if(STATIC||reduced.matches||!v.dataset.visible||v.dataset.visible==='false'||document.hidden||dialog.open){v.pause();return;}
 if(!v.getAttribute('src'))v.src=v.dataset.src;
 v.muted=true;v.play().catch(()=>{});
}
const syncAll=()=>videos.forEach(syncVideo);
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{target.dataset.visible=String(isIntersecting);syncVideo(target);});},{threshold:.15});videos.forEach(v=>observer.observe(v));}
else{videos.forEach(v=>v.dataset.visible='true');syncAll();}
document.addEventListener('visibilitychange',syncAll);reduced.addEventListener('change',syncAll);
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-zoom]');if(!button)return;lastZoom=button;image.src=button.dataset.zoom;image.alt=button.dataset.label;document.getElementById('art-title').textContent=button.dataset.label;stage.classList.remove('zoomed');stage.scrollTop=0;stage.scrollLeft=0;zoom.textContent='放大细节';zoom.setAttribute('aria-pressed','false');dialog.showModal();syncAll();});
document.getElementById('art-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>{syncAll();lastZoom?.focus({preventScroll:true});});
zoom.addEventListener('click',()=>{const enlarged=stage.classList.toggle('zoomed');stage.style.setProperty('--zoom-width',Math.max(image.naturalWidth,stage.clientWidth*1.65)+'px');zoom.textContent=enlarged?'适合屏幕':'放大细节';zoom.setAttribute('aria-pressed',String(enlarged));});
})();
