(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const staticPreview = new URLSearchParams(location.search).has('static');
  const motion = document.querySelector('.case-motion');
  const dialog = document.querySelector('.art-dialog');
  const stage = dialog.querySelector('.dialog-stage');
  const image = document.getElementById('art-image');
  const zoom = document.getElementById('art-zoom');
  let lastZoom;

  let syncVideo = () => {};
  if (motion) {
    const frames = [...motion.querySelectorAll('.motion-frame')];
    const buttons = [...motion.querySelectorAll('.motion-picker button')];
    const videos = frames.map(frame => frame.querySelector('video'));
    const toggle = motion.querySelector('.motion-toggle');
    const playPreference = new WeakMap();
    const visible = new Set();
    let current = 0;

    const updateToggle = () => {
      const video = videos[current];
      toggle.disabled = Boolean(video.error);
      toggle.textContent = video.error ? '动态暂不可播放' : video.paused ? '播放动态' : '暂停动态';
    };

    syncVideo = () => {
      if (staticPreview) return;
      const video = videos[current];
      const shouldPlay = playPreference.get(video) ?? !reduced.matches;
      if (!shouldPlay || document.hidden || dialog.open || !visible.has(video)) {
        video.pause();
        updateToggle();
        return;
      }
      if (!video.hasAttribute('src')) video.src = video.dataset.src;
      video.muted = true;
      video.play().then(updateToggle, updateToggle);
    };

    buttons.forEach((button, index) => button.addEventListener('click', () => {
      if (index === current) return;
      videos[current].pause();
      frames[current].hidden = true;
      buttons[current].setAttribute('aria-pressed', 'false');
      current = index;
      const video = videos[current];
      if (!video.poster) video.poster = video.dataset.poster;
      frames[current].hidden = false;
      button.setAttribute('aria-pressed', 'true');
      updateToggle();
      syncVideo();
    }));

    if (!staticPreview) {
      toggle.hidden = false;
      toggle.addEventListener('click', () => {
        const video = videos[current];
        playPreference.set(video, video.paused);
        if (video.paused) visible.add(video);
        syncVideo();
      });
      for (const video of videos) {
        for (const event of ['play', 'pause', 'error']) video.addEventListener(event, updateToggle);
      }
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          }
          syncVideo();
        }, {threshold: 0.25});
        videos.forEach(video => observer.observe(video));
      } else {
        videos.forEach(video => visible.add(video));
        syncVideo();
      }
      document.addEventListener('visibilitychange', syncVideo);
      reduced.addEventListener('change', syncVideo);
      dialog.addEventListener('close', syncVideo);
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-zoom]');
    if (!button) return;
    lastZoom = button;
    image.src = button.dataset.zoom;
    image.alt = button.dataset.label;
    document.getElementById('art-title').textContent = button.dataset.label;
    stage.classList.remove('zoomed');
    zoom.textContent = '放大细节';
    zoom.setAttribute('aria-pressed', 'false');
    dialog.showModal();
    stage.scrollTo(0, 0);
    syncVideo();
  });
  document.getElementById('art-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => lastZoom?.focus({preventScroll: true}));
  zoom.addEventListener('click', () => {
    const enlarged = stage.classList.toggle('zoomed');
    stage.style.setProperty('--zoom-width', Math.max(image.naturalWidth, stage.clientWidth * 1.65) + 'px');
    zoom.textContent = enlarged ? '适合屏幕' : '放大细节';
    zoom.setAttribute('aria-pressed', String(enlarged));
  });
})();
