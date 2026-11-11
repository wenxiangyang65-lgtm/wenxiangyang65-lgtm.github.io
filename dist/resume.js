(() => {
  const sheets = [...document.querySelectorAll('.resume-page .resume-sheet')];
  const dialog = document.querySelector('#resume-dialog');
  if (!dialog || !sheets.length) return;

  const viewport = dialog.querySelector('.resume-dialog-body');
  const preview = dialog.querySelector('.resume-dialog-page');
  const heading = dialog.querySelector('#resume-dialog-title');
  const zoom = dialog.querySelector('[data-resume-zoom]');
  const previous = dialog.querySelector('[data-resume-previous]');
  const next = dialog.querySelector('[data-resume-next]');
  let page = 0;

  function show(index) {
    page = Math.max(0, Math.min(sheets.length - 1, index));
    const sheet = sheets[page].cloneNode(true);
    const portrait = sheet.querySelector('img');
    if (portrait) portrait.loading = 'eager';
    preview.replaceChildren(sheet);
    heading.textContent = `简历预览 · ${page + 1} / ${sheets.length}`;
    previous.disabled = page === 0;
    next.disabled = page === sheets.length - 1;
    viewport.scrollTo(0, 0);
  }

  function setZoom(value) {
    dialog.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value));
    zoom.textContent = value ? '适合屏幕' : '放大阅读';
  }

  document.querySelectorAll('[data-resume-open]').forEach(button => {
    button.addEventListener('click', () => {
      setZoom(matchMedia('(max-width: 800px)').matches);
      dialog.showModal();
      show(Number(button.dataset.resumeOpen));
    });
  });
  previous.addEventListener('click', () => show(page - 1));
  next.addEventListener('click', () => show(page + 1));
  zoom.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));
  dialog.querySelector('[data-resume-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('.resume-works-link')) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (dialog.classList.contains('is-zoomed')) return;
    show(page + (event.key === 'ArrowRight' ? 1 : -1));
    event.preventDefault();
  });
})();
