(() => {
  const triggers = [...document.querySelectorAll('.image-open')];
  const dialog = document.querySelector('#image-viewer');
  const picture = document.querySelector('#viewer-image');
  const caption = document.querySelector('#viewer-caption');
  const counter = document.querySelector('#viewer-count');
  const error = document.querySelector('#viewer-error');
  const previous = document.querySelector('#viewer-prev');
  const next = document.querySelector('#viewer-next');
  const zoom = document.querySelector('#viewer-zoom');
  const stage = document.querySelector('.viewer-stage');
  let index = 0;
  let trigger = null;

  function showImage(newIndex) {
    index = Math.max(0, Math.min(newIndex, triggers.length - 1));
    const item = triggers[index];
    picture.hidden = false;
    error.hidden = true;
    zoom.disabled = true;
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = '放大细节';
    stage.scrollTo(0,0);
    picture.alt = item.dataset.alt;
    picture.src = item.dataset.full;
    caption.textContent = item.dataset.alt;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${triggers.length}`;
    previous.disabled = index === 0;
    next.disabled = index === triggers.length - 1;
  }

  function toggleZoom() {
    const expanded = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.textContent = expanded ? '适应屏幕' : '放大细节';
    dialog.style.setProperty('--image-width', `${picture.naturalWidth}px`);
    requestAnimationFrame(() => stage.scrollTo(expanded ? (stage.scrollWidth-stage.clientWidth)/2 : 0, expanded ? (stage.scrollHeight-stage.clientHeight)/2 : 0));
  }
  zoom.addEventListener('click', toggleZoom);
  picture.addEventListener('dblclick', toggleZoom);
  let drag = null;
  stage.addEventListener('pointerdown', event => {
    if (!dialog.classList.contains('is-zoomed') || event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    drag = {x:event.clientX,y:event.clientY,left:stage.scrollLeft,top:stage.scrollTop};
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    stage.scrollTo(drag.left-event.clientX+drag.x, drag.top-event.clientY+drag.y);
  });
  const endDrag = () => {drag=null;stage.classList.remove('dragging');};
  stage.addEventListener('pointerup',endDrag);
  stage.addEventListener('pointercancel',endDrag);

  triggers.forEach((button, position) => button.addEventListener('click', () => {
    trigger = button;
    showImage(position);
    dialog.showModal();
    document.body.classList.add('viewer-open');
  }));
  document.querySelector('#viewer-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showImage(index - 1));
  next.addEventListener('click', () => showImage(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    if (trigger) trigger.focus({preventScroll:true});
  });
  picture.addEventListener('error', () => {
    picture.hidden = true;
    error.hidden = false;
    zoom.disabled = true;
  });
  picture.addEventListener('load', () => {
    zoom.disabled = false;
    dialog.style.setProperty('--image-width', `${picture.naturalWidth}px`);
  });
})();
