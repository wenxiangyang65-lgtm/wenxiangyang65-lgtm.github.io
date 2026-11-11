(() => {
  const page = document.querySelector('.resume-page img');
  const opener = document.querySelector('[data-resume-open]');
  const dialog = document.querySelector('#resume-dialog');
  if (!page || !opener || !dialog) return;

  const image = dialog.querySelector('img');
  const zoom = dialog.querySelector('[data-resume-zoom]');
  const body = dialog.querySelector('.resume-dialog-body');

  function setZoom(value) {
    dialog.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value));
    zoom.textContent = value ? '适合屏幕' : '放大阅读';
  }

  opener.addEventListener('click', () => {
    image.src = page.currentSrc || page.src;
    image.alt = page.alt;
    setZoom(matchMedia('(max-width: 600px)').matches);
    dialog.showModal();
    body.scrollTo(0, 0);
  });
  zoom.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));
  dialog.querySelector('.resume-works-link').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-resume-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();
