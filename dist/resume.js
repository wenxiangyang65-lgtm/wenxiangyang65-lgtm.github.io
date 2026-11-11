(() => {
  const dialog = document.querySelector('#resume-dialog');
  const viewport = dialog.querySelector('.resume-dialog-body');
  const zoom = dialog.querySelector('[data-resume-zoom]');

  function setZoom(value) {
    dialog.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value));
    zoom.textContent = value ? '恢复字号' : '放大阅读';
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-resume-open]');
    if (!trigger) return;
    trigger.focus({ preventScroll: true });
    setZoom(false);
    dialog.showModal();
    viewport.scrollTo(0, 0);
  });

  zoom.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));
  dialog.querySelector('[data-resume-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('.resume-works-link')) dialog.close();
  });
})();
