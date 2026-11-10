/* The original catalog data drives the type index, disc art and project links. */
window.createPortfolioDirectory = function ({projects, filmPreview, reduced}) {
  const groups = [
    {id: 'integrated', name: '品牌整合与营销设计'},
    {id: 'film', name: '品牌影像与内容设计'},
    {id: 'operations', name: '运营视觉与节点传播'},
    {id: 'ip', name: '品牌 IP 与三维设计'},
    {id: 'explore', name: '个人设计探索'}
  ];
  const items = projects.flatMap(parent => (parent.catalogItems || []).map(item => ({
    ...item,
    cover: item.id === parent.slug ? parent.cover : item.image,
    isCard: item.id === parent.slug && parent.cover === parent.card,
    films: item.filmFirst ? parent.films : null
  })));
  const index = document.querySelector('#catalog-index');
  const directory = document.querySelector('#catalog-folders');
  const gallery = document.querySelector('#catalog-gallery');
  const down = document.querySelector('.catalog-down');
  const stage = gallery.querySelector('.gallery-stage');
  const title = gallery.querySelector('.gallery-title');
  const count = gallery.querySelector('.gallery-count');
  const openLink = gallery.querySelector('.gallery-open');
  const back = gallery.querySelector('.gallery-back');
  const status = document.querySelector('#directory-status');
  const storageKey = 'portfolio-category-directory';
  const buttons = new Map();
  const number = n => String(n).padStart(2, '0');
  let group = null;
  let discs = [];
  let selected = 0;
  let opening = false;
  let drag = null;
  let suppressClickUntil = 0;

  function scrollTo(element, instant = false) {
    element.scrollIntoView({block: 'start', behavior: instant || reduced.matches ? 'instant' : 'smooth'});
  }

  function remember() {
    try {
      if (!group) sessionStorage.removeItem(storageKey);
      else sessionStorage.setItem(storageKey, JSON.stringify({open: group.id, item: discs[selected].item.id}));
    } catch {}
  }

  function openProject(event, item, trigger) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== '#catalog') history.replaceState(history.state, '', '#catalog');
    remember();
    if (filmPreview.open(item, trigger)) return;
    if (!reduced.matches) {
      document.querySelector('.transition-curtain img').src = item.cover;
      document.body.classList.add('is-opening');
      setTimeout(() => { location.href = item.entry; }, 180);
    } else location.href = item.entry;
  }

  function createDisc(item, position) {
    const link = document.createElement('a');
    link.className = 'gallery-disc';
    link.href = item.entry;
    link.draggable = false;
    link.hidden = true;
    const art = document.createElement('span');
    art.className = 'gallery-disc-art';
    if (item.isCard) art.classList.add('is-card');
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    if (Array.isArray(item.imageFocus) && item.imageFocus.length === 2) {
      image.style.objectPosition = item.imageFocus.map(value => Math.max(0, Math.min(100, value)) + '%').join(' ');
    }
    art.append(image);
    link.append(art);
    link.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      if (position !== selected && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        select(position);
        link.focus({preventScroll: true});
      } else openProject(event, item, link);
    });
    return {item, link, image};
  }

  function select(position, announce = true) {
    const length = discs.length;
    if (!length) return;
    selected = (position + length) % length;
    const previous = length === 2 ? selected - 1 : (selected - 1 + length) % length;
    const next = length === 2 ? selected + 1 : (selected + 1) % length;
    discs.forEach(({item, link, image}, i) => {
      const slot = i === selected ? 'active' : i === previous ? 'previous' : i === next ? 'next' : '';
      link.hidden = !slot;
      if (!slot) return;
      link.dataset.slot = slot;
      if (!image.hasAttribute('src')) image.src = item.cover;
      link.setAttribute('aria-label', i === selected ? `打开${item.title}` : `切换至${item.title}`);
      if (i === selected && item.films?.length) link.setAttribute('aria-haspopup', 'dialog');
      else link.removeAttribute('aria-haspopup');
    });

    const {item} = discs[selected];
    count.textContent = `${number(selected + 1)} / ${number(length)}`;
    title.textContent = item.title;
    openLink.href = item.entry;
    openLink.textContent = item.films?.length ? '观看影片 ↗' : '查看项目 ↗';
    if (item.films?.length) openLink.setAttribute('aria-haspopup', 'dialog');
    else openLink.removeAttribute('aria-haspopup');
    if (announce) {
      status.textContent = `${count.textContent} · ${item.title}`;
      remember();
    }
  }

  function showGallery(nextGroup, itemId = null, restore = false) {
    group = nextGroup;
    discs = items.filter(item => item.group === group.id).map(createDisc);
    if (!discs.length) return;
    index.hidden = true;
    gallery.hidden = false;
    down.href = '#' + gallery.id;
    gallery.querySelector('#gallery-category').textContent = group.name;
    stage.replaceChildren(...discs.map(disc => disc.link));
    select(Math.max(0, discs.findIndex(disc => disc.item.id === itemId)), !restore);
    gallery.classList.toggle('is-entering', !restore && !reduced.matches);
    scrollTo(gallery, restore);
    if (!restore) back.focus({preventScroll: true});
  }

  function openGroup(nextGroup, button) {
    if (opening || group) return;
    if (reduced.matches) {
      showGallery(nextGroup);
      return;
    }
    opening = true;
    button.classList.add('is-dissolving');
    setTimeout(() => {
      showGallery(nextGroup);
      button.classList.remove('is-dissolving');
      opening = false;
    }, 240);
  }

  groups.forEach((entry, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'catalog-category';
    button.id = 'folder-' + entry.id;
    button.setAttribute('aria-controls', gallery.id);
    const label = document.createElement('span');
    label.className = 'catalog-category-label';
    label.textContent = `${number(i + 1)} ${entry.name}`;
    const bits = document.createElement('span');
    bits.className = 'catalog-category-bits';
    bits.textContent = `${number(i + 1)} / 0101 { 01 } · 1010`;
    bits.setAttribute('aria-hidden', 'true');
    button.append(label, bits);
    button.addEventListener('click', () => openGroup(entry, button));
    directory.append(button);
    buttons.set(entry.id, button);
  });
  document.querySelector('#directory-total').textContent = `${number(groups.length)} DIRECTIONS / ${items.length} WORKS`;

  back.addEventListener('click', () => {
    const button = buttons.get(group.id);
    group = null;
    discs = [];
    gallery.hidden = true;
    gallery.classList.remove('is-entering');
    stage.replaceChildren();
    index.hidden = false;
    down.href = '#' + index.id;
    remember();
    scrollTo(index, true);
    button.focus({preventScroll: true});
  });
  gallery.addEventListener('animationend', event => {
    if (event.animationName === 'disc-arrive') gallery.classList.remove('is-entering');
  });
  gallery.querySelector('.gallery-previous').addEventListener('click', () => select(selected - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => select(selected + 1));
  openLink.addEventListener('click', event => openProject(event, discs[selected].item, openLink));
  stage.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(selected + (event.key === 'ArrowRight' ? 1 : -1));
    stage.focus({preventScroll: true});
  });

  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, moving: false};
  });
  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moving && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      drag.moving = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    if (drag.moving) stage.style.setProperty('--drag-x', `${Math.max(-100, Math.min(100, dx * .45))}px`);
  });
  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (drag.moving) {
      suppressClickUntil = performance.now() + 250;
      const dx = event.clientX - drag.x;
      if (event.type === 'pointerup' && Math.abs(dx) > 36) select(selected + (dx < 0 ? 1 : -1));
    }
    drag = null;
    stage.classList.remove('is-dragging');
    stage.style.removeProperty('--drag-x');
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);

  function restore() {
    document.body.classList.remove('is-opening');
    if (location.hash !== '#catalog' || group) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      const previous = groups.find(entry => entry.id === saved?.open);
      if (previous) requestAnimationFrame(() => {
        if (location.hash === '#catalog' && !group && !opening) showGallery(previous, saved.item, true);
      });
    } catch {}
  }
  window.addEventListener('pageshow', restore);
  window.addEventListener('hashchange', restore);
  restore();
  return {restore};
};
