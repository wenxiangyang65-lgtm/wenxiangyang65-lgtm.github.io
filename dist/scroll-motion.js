'use strict';
(() => {
  const videos = [...document.querySelectorAll('video[data-motion-src]')];
  if (!videos.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nativeToggle = document.querySelector('[data-motion-native]');
  let enabled = !reduced.matches && !(nativeToggle && document.body.classList.contains('paused'));
  const visible = new Set();
  const toggles = [...document.querySelectorAll('[data-motion-toggle]')];
  function update(video) {
    const frame = video.closest('.scroll-motion');
    if (!enabled || document.hidden || !visible.has(video)) {
      video.pause(); frame.classList.remove('is-playing'); return;
    }
    if (!video.hasAttribute('src')) { video.src = video.dataset.motionSrc; video.load(); }
    video.muted = true; video.defaultMuted = true;
    video.play().catch(() => frame.classList.remove('is-playing'));
  }
  function sync() {
    toggles.forEach(button => {
      if (button.hasAttribute('data-motion-native')) return;
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? '暂停动态' : '播放动态';
    });
    videos.forEach(update);
  }
  videos.forEach(video => {
    const frame = video.closest('.scroll-motion');
    video.addEventListener('playing', () => {
      if (enabled && visible.has(video) && !document.hidden) frame.classList.add('is-playing');
      else update(video);
    });
    video.addEventListener('error', () => frame.classList.remove('is-playing'));
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target.querySelector('video[data-motion-src]');
      if (entry.isIntersecting && entry.intersectionRatio >= .2) visible.add(video);
      else visible.delete(video);
      update(video);
    }), {threshold:[0,.2]});
    videos.forEach(video => observer.observe(video.closest('.scroll-motion')));
  } else {
    const check = () => { videos.forEach(video => {
      const r = video.closest('.scroll-motion').getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) visible.add(video); else visible.delete(video);
    }); sync(); };
    addEventListener('scroll',check,{passive:true}); addEventListener('resize',check); check();
  }
  toggles.forEach(button => button.addEventListener('click', () => {
    enabled = button.hasAttribute('data-motion-native') ? !document.body.classList.contains('paused') : !enabled;
    sync();
  }));
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change', () => {
    enabled = !reduced.matches && !(nativeToggle && document.body.classList.contains('paused')); sync();
  });
  sync();
})();
