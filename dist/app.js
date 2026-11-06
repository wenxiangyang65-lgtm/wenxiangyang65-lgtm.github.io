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
const video = document.querySelector('#cover-video');
const toggle = document.querySelector('#motion-toggle');
let paused = reduced.matches;
let coverVisible = false;
const intro = document.querySelector('#cover');
const root = document.documentElement;
const innerPage = document.querySelector('main');
let introExitTimer = 0;
let unloadTimer = 0;

function startVideo() {
  if (!root.classList.contains('intro-open') || paused || !coverVisible || document.hidden ||
      document.querySelector('#catalog-film-dialog').open) return;

  if (!video.hasAttribute('src')) video.src = video.dataset.src;
  video.play().catch(error => {
    if (error.name === 'NotAllowedError') {
      paused = true;
      updateMotion();
    }
  });
}

function updateMotion() {
  toggle.setAttribute('aria-label', paused ? '播放封面动态' : '暂停封面动态');
  toggle.textContent = paused ? '播放动态' : '暂停动态';
  if (paused) video.pause();
  else startVideo();
}

toggle.addEventListener('click', () => {
  paused = !paused;
  updateMotion();
});
video.addEventListener('playing', () => video.classList.add('ready'));
video.addEventListener('error', () => video.classList.remove('ready'));

new IntersectionObserver(([entry]) => {
  coverVisible = entry.intersectionRatio >= .1;
  clearTimeout(unloadTimer);
  if (coverVisible) {
    startVideo();
    return;
  }

  video.pause();
  if (video.hasAttribute('src')) {
    unloadTimer = setTimeout(() => {
      video.removeAttribute('src');
      video.load();
      video.classList.remove('ready');
    }, 1500);
  }
}, {threshold: .1}).observe(intro);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
  else startVideo();
});
reduced.addEventListener('change', event => {
  paused = event.matches;
  updateMotion();
});
window.addEventListener('portfolio-film-close', startVideo);
function syncIntro() {
  const open = !location.hash || location.hash === '#cover';
  const wasOpen = root.classList.contains('intro-open');
  clearTimeout(introExitTimer);
  root.classList.toggle('intro-exiting', wasOpen && !open && !reduced.matches);
  root.classList.toggle('intro-open', open);
  intro.inert = !open;
  innerPage.inert = open;

  if (open) {
    window.scrollTo({top: 0, behavior: 'instant'});
    startVideo();
  } else if (wasOpen) {
    introExitTimer = setTimeout(() => {
      root.classList.remove('intro-exiting');
      if (location.hash === '#resume') {
        document.querySelector('#resume').focus({preventScroll: true});
      }
    }, reduced.matches ? 0 : 620);
  }
}

function enterInnerPage() {
  if (root.classList.contains('intro-open')) location.hash = 'resume';
}

let wheelDistance = 0;
let lastWheelTime = 0;
intro.addEventListener('wheel', event => {
  if (event.ctrlKey || event.deltaY <= 0 || event.deltaY < Math.abs(event.deltaX)) return;
  const now = performance.now();
  if (now - lastWheelTime > 180) wheelDistance = 0;
  lastWheelTime = now;
  wheelDistance += event.deltaMode ? event.deltaY * 24 : event.deltaY;
  if (wheelDistance >= 24) {
    wheelDistance = 0;
    enterInnerPage();
  }
}, {passive: true});

let touchStart;
intro.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? event.touches[0].clientY : undefined;
}, {passive: true});
intro.addEventListener('touchend', event => {
  if (touchStart !== undefined && touchStart - event.changedTouches[0].clientY > 45) {
    enterInnerPage();
  }
  touchStart = undefined;
}, {passive: true});
document.addEventListener('keydown', event => {
  if (!root.classList.contains('intro-open') || event.ctrlKey || event.metaKey ||
      !['ArrowDown', 'PageDown', 'End'].includes(event.key)) return;
  event.preventDefault();
  enterInnerPage();
});
window.addEventListener('hashchange', syncIntro);
syncIntro();
updateMotion();
