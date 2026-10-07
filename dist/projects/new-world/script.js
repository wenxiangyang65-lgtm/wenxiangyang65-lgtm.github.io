const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');

document.querySelectorAll('[data-zoom]').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    lightboxImage.src = button.dataset.zoom;
    lightboxImage.alt = image?.alt || '';
    lightboxCaption.textContent = image?.alt || '';
    lightbox.showModal();
  });
});

document.getElementById('lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  lightboxImage.removeAttribute('src');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const video = document.getElementById('invite-video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) {
  const videoObserver = new IntersectionObserver((entries) => {
    const visible = entries[0]?.isIntersecting;
    if (visible) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.55 });
  videoObserver.observe(video);
}

// The MP4 is exported as a clean, transparent animation so every frame uses
// the same verified alpha edges without playback-time chroma keying.
const heroMotion = document.getElementById('hero-motion');
const heroArt = document.querySelector('.hero-art');
function updateHeroMotion() {
  heroArt.classList.toggle('motion-ready',
    heroMotion.complete && heroMotion.naturalWidth > 0 && !reducedMotion.matches);
}
heroMotion.addEventListener('load', updateHeroMotion);
heroMotion.addEventListener('error', () => heroArt.classList.remove('motion-ready'));
reducedMotion.addEventListener('change', updateHeroMotion);
updateHeroMotion();

const beeMotion = document.getElementById('bee-motion');
const beeVisual = document.querySelector('.bee-visual');
function updateBeeMotion() {
  beeVisual.classList.toggle('motion-ready',
    beeMotion.complete && beeMotion.naturalWidth > 0 && !reducedMotion.matches);
}
function alignBeeMotion() {
  // Fit the original 1300 × 1460 image bounds, with overscan for the animation's
  // upward motion. The first frame keeps the original subject scale and center.
  const width = Math.min(beeVisual.clientWidth, beeVisual.clientHeight * 1300 / 1460);
  const height = width * 1460 / 1300;
  beeMotion.style.width = `${width * 1.0794875020010521}px`;
  beeMotion.style.height = `${height * 1.0794875020010521}px`;
  beeMotion.style.left = `${(beeVisual.clientWidth - width) / 2 - width * .03952479633248949}px`;
  beeMotion.style.top = `${(beeVisual.clientHeight - height) / 2 - height * .07433736592951723}px`;
}
beeMotion.addEventListener('load', updateBeeMotion);
beeMotion.addEventListener('error', () => beeVisual.classList.remove('motion-ready'));
reducedMotion.addEventListener('change', updateBeeMotion);
new ResizeObserver(alignBeeMotion).observe(beeVisual);
alignBeeMotion();
updateBeeMotion();
