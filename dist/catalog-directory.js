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
    cover: item.image,
    isCard: item.image === parent.card,
    films: item.filmFirst ? parent.films : null
  })));
  const index = document.querySelector('#catalog-index');
  const directory = document.querySelector('#catalog-folders');
  const gallery = document.querySelector('#catalog-gallery');
  const root = document.documentElement;
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
  let openTimer = 0;
  let wheelTime = -Infinity;
  let wheelDistance = 0;
  let wheelDirection = 0;
  let wheelStepped = false;
  let drag = null;
  let tilt = null;
  let suppressClickUntil = 0;

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
    const rim = document.createElement('span');
    rim.className = 'gallery-disc-rim';
    rim.setAttribute('aria-hidden', 'true');
    link.append(rim, art);
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
    clearDiscTilt();
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

  const routeFor = entry => '#gallery-' + entry.id;

  function showGallery(nextGroup, itemId = null, animate = false) {
    const projectsInGroup = items.filter(item => item.group === nextGroup.id);
    if (!projectsInGroup.length) return;
    group = nextGroup;
    discs = projectsInGroup.map(createDisc);
    wheelTime = -Infinity;
    gallery.querySelector('#gallery-category').textContent = group.name;
    stage.replaceChildren(...discs.map(disc => disc.link));
    gallery.hidden = false;
    root.classList.add('catalog-gallery-open');
    buttons.get(group.id).setAttribute('aria-expanded', 'true');
    select(Math.max(0, discs.findIndex(disc => disc.item.id === itemId)));
    gallery.classList.toggle('is-entering', animate && !reduced.matches);
    back.focus({preventScroll: true});
  }

  function hideGallery() {
    if (!group) return;
    buttons.get(group.id).setAttribute('aria-expanded', 'false');
    group = null;
    discs = [];
    gallery.hidden = true;
    clearDiscTilt();
    gallery.classList.remove('is-entering');
    stage.replaceChildren();
    drag = null;
    stage.classList.remove('is-dragging');
    stage.style.removeProperty('--drag-x');
    root.classList.remove('catalog-gallery-open');
    const film = document.querySelector('#catalog-film-dialog');
    if (film.open) film.close();
  }

  function openGroup(nextGroup, button) {
    if (openTimer || group) return;
    function enter() {
      openTimer = 0;
      button.classList.remove('is-dissolving');
      history.pushState(history.state, '', routeFor(nextGroup));
      showGallery(nextGroup, null, true);
    }
    if (reduced.matches) enter();
    else {
      button.classList.add('is-dissolving');
      openTimer = setTimeout(enter, 240);
    }
  }

  const hoverGlyphs = '01{10}/01[0]';
  const codeStrip = hoverGlyphs.repeat(2);
  groups.forEach((entry, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'catalog-category';
    button.id = 'folder-' + entry.id;
    const labelText = `${number(i + 1)} ${entry.name}`;
    button.setAttribute('aria-label', labelText);
    button.setAttribute('aria-controls', gallery.id);
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.className = 'catalog-category-label';
    label.setAttribute('aria-hidden', 'true');
    Array.from(labelText).forEach((character, position) => {
      if (character === ' ') {
        label.append(character);
        return;
      }
      const letter = document.createElement('span');
      letter.className = 'catalog-category-letter';
      letter.textContent = character;
      const columns = character.codePointAt(0) > 127 ? 8 : 4;
      letter.dataset.code = Array.from({length: 5}, (_, line) => {
        const start = (position * 3 + i + line * 5) % hoverGlyphs.length;
        return codeStrip.slice(start, start + columns - Math.abs(line - 2));
      }).join('\n');
      letter.style.setProperty('--resolve-delay', `${30 + 24 * position}ms`);
      label.append(letter);
    });
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

  function returnToIndex() {
    if (!group) return;
    const button = buttons.get(group.id);
    history.replaceState(history.state, '', '#' + index.id);
    hideGallery();
    remember();
    index.scrollIntoView({block: 'start', behavior: 'instant'});
    button.focus({preventScroll: true});
  }

  back.addEventListener('click', returnToIndex);
  gallery.addEventListener('keydown', event => {
    if (event.key === 'Escape') returnToIndex();
  });
  gallery.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    const direction = Math.sign(delta);
    if (now - wheelTime > 145 || direction !== wheelDirection) {
      wheelDistance = 0;
      wheelStepped = false;
    }
    wheelTime = now;
    wheelDirection = direction;
    if (wheelStepped) return;
    wheelDistance += Math.abs(delta) * (event.deltaMode ? 24 : 1);
    if (wheelDistance < 42) return;
    wheelStepped = true;
    select(selected + direction);
  }, {passive: false});

  gallery.addEventListener('animationend', event => {
    if (event.animationName === 'disc-arrive') gallery.classList.remove('is-entering');
  });
  gallery.querySelector('.gallery-previous').addEventListener('click', () => select(selected - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => select(selected + 1));
  openLink.addEventListener('click', event => openProject(event, discs[selected].item, openLink));
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    select(selected + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1));
    stage.focus({preventScroll: true});
  });

  function clearDiscTilt() {
    if (!tilt) return;
    tilt.disc.classList.remove('is-tilting');
    for (const axis of ['pitch', 'yaw', 'roll']) tilt.disc.style.removeProperty('--hover-' + axis);
    tilt = null;
  }

  function tiltDisc(disc, event, held = false) {
    if (reduced.matches || gallery.classList.contains('is-entering')) return;
    if (!disc || disc.hidden) {
      clearDiscTilt();
      return;
    }
    // Keep the original pointer area stable while the disc rotates underneath it.
    const rect = tilt?.disc === disc ? tilt.bounds : disc.getBoundingClientRect();
    const x = 2 * (event.clientX - rect.left) / rect.width - 1;
    const y = 2 * (event.clientY - rect.top) / rect.height - 1;
    if (!held && Math.hypot(x, y) > 1.08) {
      clearDiscTilt();
      return;
    }
    if (tilt?.disc !== disc) {
      clearDiscTilt();
      tilt = {disc, bounds: rect};
      disc.classList.add('is-tilting');
    }
    const horizontal = Math.max(-1, Math.min(1, x));
    const vertical = Math.max(-1, Math.min(1, y));
    const strength = held ? 1.6 : 1;
    disc.style.setProperty('--hover-pitch', `${(-vertical * 14 * strength).toFixed(2)}deg`);
    disc.style.setProperty('--hover-yaw', `${(horizontal * 16 * strength).toFixed(2)}deg`);
    disc.style.setProperty('--hover-roll', `${(horizontal * 5 * strength).toFixed(2)}deg`);
  }

  stage.addEventListener('pointerleave', () => {
    if (!drag) clearDiscTilt();
  });
  reduced.addEventListener('change', clearDiscTilt);
  stage.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0 || !event.isPrimary) return;
    const disc = reduced.matches ? null : event.target.closest('.gallery-disc');
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, disc, moving: false};
    if (!disc) clearDiscTilt();
    else if (event.pointerType !== 'mouse') tiltDisc(disc, event);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) {
      if (event.pointerType === 'mouse') tiltDisc(event.target.closest('.gallery-disc'), event);
      return;
    }
    if (drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const moved = drag.disc ? Math.hypot(dx, dy) > 5 : Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
    if (!drag.moving && moved) {
      drag.moving = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    if (!drag.moving) return;
    if (drag.disc) tiltDisc(drag.disc, event, true);
    else stage.style.setProperty('--drag-x', `${Math.max(-100, Math.min(100, dx * .45))}px`);
  });
  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (drag.moving) {
      suppressClickUntil = performance.now() + 250;
      const dx = event.clientX - drag.x;
      if (!drag.disc && event.type === 'pointerup' && Math.abs(dx) > 36) select(selected + (dx < 0 ? 1 : -1));
    }
    drag = null;
    clearDiscTilt();
    stage.classList.remove('is-dragging');
    stage.style.removeProperty('--drag-x');
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) endDrag(event);
  });

  function restore() {
    document.body.classList.remove('is-opening');
    clearTimeout(openTimer);
    openTimer = 0;
    directory.querySelector('.is-dissolving')?.classList.remove('is-dissolving');
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch {}
    const route = groups.find(entry => location.hash === routeFor(entry));
    if (route) {
      if (group?.id !== route.id) {
        hideGallery();
        showGallery(route, saved?.open === route.id ? saved.item : null);
      }
      return;
    }
    if (group) {
      hideGallery();
      return;
    }
    const cameFromProject = document.referrer.startsWith(location.origin + '/projects/');
    if (location.hash === '#catalog' && cameFromProject) {
      const previous = groups.find(entry => entry.id === saved?.open);
      if (previous) {
        history.replaceState(history.state, '', routeFor(previous));
        showGallery(previous, saved.item);
      }
    }
  }
  window.addEventListener('pageshow', restore);
  window.addEventListener('hashchange', restore);
  restore();
  return {restore};
};
