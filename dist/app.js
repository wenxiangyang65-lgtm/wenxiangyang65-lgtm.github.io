const projects=window.PORTFOLIO_PROJECTS;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
window.portfolioSuppressClickUntil=0;
const filmPreview=window.createPortfolioFilmPreview({onOpen:()=>{window.dispatchEvent(new Event('portfolio-film-open'));document.querySelector('#cover-video').pause()},onClose:()=>window.dispatchEvent(new Event('portfolio-film-close'))});
let directory=null;
function initializeDirectory(){
 if(directory)return;
 directory=window.createPortfolioDirectory({projects,filmPreview,reduced,onSuppressClick:time=>{window.portfolioSuppressClickUntil=time}});
}
if(location.hash==='#catalog'||!('IntersectionObserver'in window))initializeDirectory();
else{const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){initializeDirectory();observer.disconnect();}},{rootMargin:'500px 0px'});observer.observe(document.querySelector('#catalog'));}
window.addEventListener('hashchange',()=>{if(location.hash==='#catalog')initializeDirectory();});
const sections=[...document.querySelectorAll('.screen')],dots=document.querySelectorAll('.page-dots a');let sectionRAF=0;
function sectionMarker(){const anchor=scrollY+innerHeight*.25;let current=sections[0];for(const section of sections)if(section.offsetTop<=anchor)current=section;dots.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
addEventListener('scroll',()=>{cancelAnimationFrame(sectionRAF);sectionRAF=requestAnimationFrame(sectionMarker)},{passive:true});addEventListener('resize',sectionMarker);sectionMarker();
const video=document.querySelector('#cover-video'),toggle=document.querySelector('#motion-toggle');let paused=reduced.matches,coverVisible=false,coverReady=false,coverEntryReady=!['#resume','#catalog'].includes(location.hash),unloadTimer=0;
function startVideo(){if(!coverEntryReady||!coverReady||paused||!coverVisible||document.hidden||document.querySelector('#catalog-film-dialog').open)return;if(!video.src){video.src=video.dataset.src;video.load()}video.play().catch(()=>{})}
function updateMotion(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放封面动态':'暂停封面动态');toggle.querySelector('.tooltip').textContent=paused?'播放动态':'暂停动态';if(paused)video.pause();else startVideo()}
toggle.addEventListener('click',()=>{paused=!paused;updateMotion()});video.addEventListener('playing',()=>video.classList.add('ready'));video.addEventListener('error',()=>video.classList.remove('ready'));
new IntersectionObserver(entries=>{coverVisible=entries[0].isIntersecting;if(!coverVisible)coverEntryReady=true;clearTimeout(unloadTimer);if(coverVisible)startVideo();else{video.pause();unloadTimer=setTimeout(()=>{if(!coverVisible){video.removeAttribute('src');video.load();video.classList.remove('ready');}},1500);}},{threshold:.1}).observe(document.querySelector('#cover'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else startVideo()});updateMotion();

// Let the original cover render before the decorative movie uses bandwidth.
const coverImage=document.querySelector('#cover .original-art');
function coverPainted(){requestAnimationFrame(()=>requestAnimationFrame(()=>{coverReady=true;startVideo();}));}
if(coverImage.complete&&coverImage.naturalWidth)coverPainted();else coverImage.addEventListener('load',coverPainted,{once:true});

window.addEventListener('hashchange',()=>{if(location.hash==='#cover'){coverEntryReady=true;startVideo();}});
