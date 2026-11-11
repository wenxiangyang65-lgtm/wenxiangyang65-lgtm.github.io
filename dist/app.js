const projects=window.PORTFOLIO_PROJECTS;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const filmPreview=window.createPortfolioFilmPreview({onOpen:()=>{window.dispatchEvent(new Event('portfolio-film-open'));document.querySelector('#cover-video').pause()},onClose:()=>window.dispatchEvent(new Event('portfolio-film-close'))});
const restoreProjectGallery = location.hash === '#catalog' &&
  document.referrer.startsWith(location.origin + '/projects/');
let directory = null;
let directoryObserver;
let glyphTitle;

function initializeDirectory() {
  if (directory) return;
  directoryObserver?.disconnect();
  directory = window.createPortfolioDirectory({projects, filmPreview, reduced, restoreProjectGallery});
  glyphTitle = window.initializeCatalogGlyphs(reduced);
}

function prepareDirectory() {
  if (directory) return;
  const hash = location.hash;
  if (hash.startsWith('#catalog') || hash.startsWith('#gallery-') || !('IntersectionObserver' in window)) {
    initializeDirectory();
  } else if (!directoryObserver) {
    directoryObserver = new IntersectionObserver(entries => {
      if (!root.classList.contains('intro-open') && entries.some(entry => entry.isIntersecting)) {
        initializeDirectory();
      }
    }, {rootMargin: '500px 0px'});
    directoryObserver.observe(document.querySelector('#catalog'));
  }
}
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
const resumeDialog = document.querySelector('#resume-dialog');
let introExitTimer = 0;
let introReturnTimer = 0;
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
  if (introReturnTimer) {
    clearTimeout(introReturnTimer);
    introReturnTimer = 0;
    if (!open) glyphTitle?.reassemble();
  }
  root.classList.remove('intro-returning');
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
      if (location.hash === '#catalog') glyphTitle?.reassemble();
      prepareDirectory();
      const destination = document.getElementById(location.hash.slice(1));
      destination?.focus({preventScroll: true});
    }, reduced.matches ? 0 : 620);
  } else {
    prepareDirectory();
  }
  sectionMarker();
}

function enterInnerPage() {
  if (root.classList.contains('intro-open')) location.hash = 'catalog';
}

function returnToCover() {
  if (introReturnTimer) return;
  const duration = 360;
  if (reduced.matches || !glyphTitle?.disperse(duration)) {
    location.hash = 'cover';
    return;
  }
  root.classList.add('intro-returning');
  introReturnTimer = setTimeout(() => {
    introReturnTimer = 0;
    location.hash = 'cover';
  }, duration);
}

let wheelDistance = 0;
let lastWheelTime = 0;
document.addEventListener('wheel', event => {
  if (event.defaultPrevented || resumeDialog?.open || root.classList.contains('catalog-gallery-open')) return;
  const open = root.classList.contains('intro-open');
  if (event.ctrlKey || root.classList.contains('intro-exiting') ||
      Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
      (open ? event.deltaY <= 0 : event.deltaY >= 0 || window.scrollY > 1)) {
    wheelDistance = 0;
    return;
  }
  const now = performance.now();
  if (now - lastWheelTime > 180) wheelDistance = 0;
  lastWheelTime = now;
  wheelDistance += Math.abs(event.deltaY) * (event.deltaMode ? 24 : 1);
  if (wheelDistance >= 24) {
    wheelDistance = 0;
    if (open) enterInnerPage();
    else returnToCover();
  }
}, {passive: true});

let touchStart;
let touchStartsOnCover;
document.addEventListener('touchstart', event => {
  if (resumeDialog?.open || root.classList.contains('catalog-gallery-open')) { touchStart = undefined; return; }
  touchStartsOnCover = root.classList.contains('intro-open');
  const canSwitchLevel = touchStartsOnCover ||
    (window.scrollY <= 1 && !root.classList.contains('intro-exiting'));
  touchStart = canSwitchLevel && event.touches.length === 1
    ? event.touches[0].clientY : undefined;
}, {passive: true});
document.addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const distance = touchStart - event.changedTouches[0].clientY;
  touchStart = undefined;
  if (touchStartsOnCover && distance > 45) enterInnerPage();
  else if (!touchStartsOnCover && distance < -45 && window.scrollY <= 1) {
    returnToCover();
  }
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
