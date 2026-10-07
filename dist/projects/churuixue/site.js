'use strict';
const motionButton = document.querySelector('.motion-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let collageFrame = 0;
function applyMotion() {
  document.body.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? '开启动效' : '暂停动态';
  document.documentElement.style.scrollBehavior = motionPaused ? 'auto' : 'smooth';
  cancelAnimationFrame(collageFrame);
  const collage = document.querySelector('.hero-collage');
  if (collage) collage.style.transform = 'none';
  document.dispatchEvent(new CustomEvent('memoir:motionchange'));
}
motionPreference.addEventListener?.('change', e => { motionPaused = e.matches; applyMotion(); });
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; applyMotion(); });
applyMotion();

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function setMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '关闭目录' : '打开目录');
  menuButton.querySelector('span').textContent = open ? '－' : '＋';
}
menuButton.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

const frames = window.MEMOIR_FRAMES;
const lightbox = document.querySelector('#lightbox');
const filmDialog = document.querySelector('#film-dialog');
const film = document.querySelector('#full-film');
let activeFrame = 0;
const dialogFocus = new WeakMap();
let pendingSeek = null;
let hdPlayer = null;
let filmInitialized = false;
const filmStatus = document.querySelector('#film-status');
function initializeFilm() {
  if (filmInitialized) {
    hdPlayer?.startLoad(pendingSeek ?? film.currentTime);
    return true;
  }
  filmStatus.hidden = false;
  filmStatus.textContent = '正在加载高清影片…';
  if (/\.mp4(?:[?#]|$)/i.test(film.dataset.src)) {
    film.src = film.dataset.src;
    filmInitialized = true;
    return true;
  }
  if (film.canPlayType('application/vnd.apple.mpegurl')) {
    film.src = film.dataset.src;
    filmInitialized = true;
    return true;
  }
  if (window.Hls?.isSupported()) {
    const player = new window.Hls({
      startPosition: pendingSeek ?? 0,
      maxBufferLength: 30,
      backBufferLength: 30,
      capLevelToPlayerSize: false
    });
    hdPlayer = player;
    filmInitialized = true;
    let recoveryCount = 0;
    player.on(window.Hls.Events.MANIFEST_PARSED, () => {
      seekFilm();
      if (filmDialog.open) film.play().catch(() => {});
    });
    player.on(window.Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      if (recoveryCount++ < 2) {
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) { player.startLoad(film.currentTime); return; }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) { player.recoverMediaError(); return; }
      }
      filmStatus.hidden = false;
      filmStatus.textContent = '高清影片加载失败，请关闭后重新打开，或在快手观看。';
      player.destroy();
      hdPlayer = null;
      filmInitialized = false;
    });
    player.loadSource(film.dataset.src);
    player.attachMedia(film);
    return true;
  }
  filmStatus.textContent = '当前浏览器无法播放高清影片，请使用下方的快手入口观看。';
  return false;
}
function openDialog(dialog) {
  if (dialog.open) return;
  const current = document.activeElement;
  const parentDialog = current?.closest?.("dialog");
  dialogFocus.set(dialog, parentDialog ? dialogFocus.get(parentDialog) : current);
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.querySelector('[data-close-dialog]').focus();
}
function displayFrame(index) {
  activeFrame = (index + frames.length) % frames.length;
  const f = frames[activeFrame];
  const im = document.querySelector('#lightbox-image');
  im.src = `assets/${f.id}-hd.webp`;
  im.alt = f.name.replace('资料影像_', '');
  document.querySelector('#lightbox-title').textContent = im.alt;
  document.querySelector('#lightbox-time').textContent = f.time;
  document.querySelector('#lightbox-play').dataset.filmTime = String(f.seconds);
  const download = document.querySelector('#lightbox-download');
  download.href = `assets/${f.id}-hd.webp`;
  download.download = `${f.name}_${f.time.replace(':', '-')}.webp`;
  document.querySelector('#lightbox-count').textContent = `${String(activeFrame + 1).padStart(2, '0')} / ${frames.length}`;
}
function seekFilm() {
  if (pendingSeek !== null && film.readyState >= 1) {
    try { film.currentTime = pendingSeek; pendingSeek = null; } catch { /* Retry when metadata becomes available. */ }
  }
}
film.addEventListener('loadedmetadata', seekFilm);
film.addEventListener('playing', () => { filmStatus.hidden = true; });
film.addEventListener('waiting', () => { filmStatus.hidden = false; filmStatus.textContent = '正在缓冲高清影片…'; });
film.addEventListener('error', () => {
  if (hdPlayer) return;
  filmStatus.hidden = false;
  filmStatus.textContent = '高清影片加载失败，请关闭后重新打开，或在快手观看。';
  filmInitialized = false;
});
document.addEventListener('click', e => {
  const frame = e.target.closest('[data-seconds]');
  if (frame) {
    const index = frames.findIndex(f => f.seconds === Number(frame.dataset.seconds));
    if (index >= 0) { displayFrame(index); openDialog(lightbox); }
  }
  const play = e.target.closest('[data-play-film]');
  if (play) {
    const requestedTime = play.getAttribute('data-film-time');
    pendingSeek = requestedTime !== null ? Number(requestedTime) : 0;
    if (lightbox.open) lightbox.close();
    const supported = initializeFilm();
    seekFilm();
    openDialog(filmDialog);
    if (supported) film.play().catch(() => {});
  }
  const close = e.target.closest('[data-close-dialog]');
  if (close) close.closest('dialog').close();
});
document.querySelector('.lightbox-prev').addEventListener('click', () => displayFrame(activeFrame - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => displayFrame(activeFrame + 1));
lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); displayFrame(activeFrame - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); displayFrame(activeFrame + 1); }
});
for (const dialog of [lightbox, filmDialog]) {
  dialog.addEventListener('close', () => {
    const otherDialogOpen = Boolean(document.querySelector('dialog[open]'));
    document.body.classList.toggle('dialog-open', otherDialogOpen);
    if (dialog === filmDialog) { film.pause(); hdPlayer?.stopLoad(); }
    if (!otherDialogOpen) dialogFocus.get(dialog)?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    }
  });
}
let touchX = 0, touchY = 0;
lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) displayFrame(activeFrame + (dx < 0 ? 1 : -1));
}, { passive: true });
filmDialog.addEventListener('cancel', () => film.pause());

// The analysis uses actual film frames, with editorial annotations.
const noteData = {
  hands: {
    label: '同一个动作 / 不同的重量', quote: '从被牵住，到去承担。',
    steps: [
      { seconds: 3, label: '被牵住', title: '把观看位置交给孩子', description: '双手置于前景，观众从孩子的位置进入故事。人物关系通过触碰建立，牵挂成为开篇的情感线索。', decision: '前景的双手，让第一人称视角拥有具体的身体感。', marker: ['13%', '67%', '37%', '25%'] },
      { seconds: 46.5, label: '去劳动', title: '让劳动发生在手边', description: '打包的动作与周围堆积的货物共同进入画面。奋斗被写进具体的劳动，观众能看见手正在做什么。', decision: '近处的动作与拥挤的空间共同交代人物的工作状态。', marker: ['31%', '53%', '33%', '34%'] },
      { seconds: 186.5, label: '成为依靠', title: '同一只手，拥有新的关系', description: '孩子握住手指，让开篇的牵手动作再次出现。人物从被牵引的人，走向可以被依靠的人。', decision: '相似动作连接两代人，为故事建立情感呼应。', marker: ['35%', '53%', '30%', '32%'] }
    ]
  },
  light: {
    label: '冷与暖 / 处境的变化', quote: '走过寒夜，也记住日光。',
    steps: [
      { seconds: 36.5, label: '冷蓝雪夜', title: '把寒冷放进画面', description: '雪、道路与远处车灯形成冷蓝色的环境。前景拦车的手，让人物的处境有了具体的动作。', decision: '环境冷色与远处暖灯并存，表达艰难处境中的方向感。', marker: ['46%', '20%', '31%', '30%'] },
      { seconds: 30.5, label: '室内暖光', title: '谋生场景的暖光', description: '餐厅的暖色光线与雪夜形成对照。不同空间的色温变化，让驻唱与赶路在视觉上拥有各自的情绪。', decision: '保留场景之间的冷暖差异，让光线参与叙事。', marker: null },
      { seconds: 186.5, label: '生活日光', title: '把温暖落回关系', description: '孩子身旁的暖色日光，将观看带回亲密关系。情绪由环境的寒冷，逐渐靠近人的陪伴。', decision: '暖色与亲密动作同时出现，完成对前段冷夜的情绪回应。', marker: null }
    ]
  },
  distance: {
    label: '景别变化 / 离别的距离', quote: '人变小了，牵挂没有。',
    steps: [
      { seconds: 96.5, label: '握手近景', title: '先留下手的触感', description: '车站告别先从握手进入。近处的动作让观众靠近人物，离别由关系的细节开始。', decision: '近景聚焦触碰，让情感先于空间被感知。', marker: ['23%', '60%', '39%', '31%'] },
      { seconds: 100, label: '车站远景', title: '再看见人的离开', description: '远景拉开人物与观众的距离。人物在更大的车站空间中变小，离开的感觉由景别变化形成。', decision: '从握手切到远景，让距离变化承担叙事。', marker: null }
    ]
  }
};
const tabs = [...document.querySelectorAll('[data-note]')];
const stepsContainer = document.querySelector('.analysis-steps');
let activeNote = 'hands';
function selectAnalysisStep(index, animate = true) {
  const data = noteData[activeNote];
  const step = data.steps[index];
  document.querySelector('#analysis-image-button').setAttribute('aria-label', `放大：${step.label}`);
  const frame = frames.find(f => f.seconds === step.seconds);
  document.querySelector('#analysis-image').src = `assets/${frame.id}.webp`;
  document.querySelector('#analysis-image').alt = frame.name;
  document.querySelector('#analysis-image-button').dataset.seconds = String(step.seconds);
  document.querySelector('#analysis-caption').textContent = frame.name;
  document.querySelector('#analysis-time').textContent = frame.time;
  document.querySelector('#analysis-label').textContent = data.label;
  document.querySelector('#note-title').textContent = step.title;
  document.querySelector('#note-description').textContent = step.description;
  document.querySelector('#analysis-decision').textContent = step.decision;
  document.querySelector('#analysis-step-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(data.steps.length).padStart(2, '0')}`;
  document.querySelector('.analysis-film').dataset.filmTime = String(step.seconds);
  const marker = document.querySelector('.analysis-marker');
  marker.hidden = !step.marker;
  if (step.marker) for (const [i, prop] of ['left', 'top', 'width', 'height'].entries()) marker.style[prop] = step.marker[i];
  stepsContainer.querySelectorAll('.analysis-step').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
  if (animate && !motionPaused && typeof Element.prototype.animate === 'function') {
    document.querySelector('.analysis-frame').animate([{ opacity: .35 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
  }
}
function selectNote(tab, animate = true) {
  activeNote = tab.dataset.note;
  const data = noteData[activeNote];
  tabs.forEach(t => { const selected = t === tab; t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1; });
  document.querySelector('#notes-panel').setAttribute('aria-labelledby', tab.id);
  stepsContainer.replaceChildren();
  data.steps.forEach((step, i) => {
    const frame = frames.find(f => f.seconds === step.seconds);
    const button = document.createElement('button');
    button.className = 'analysis-step';
    button.setAttribute('aria-pressed', String(i === 0));
    button.setAttribute('aria-label', `查看${step.label}的镜头分析`);
    const image = document.createElement('img');
    image.src = `assets/${frame.id}-sm.webp`; image.alt = ''; image.width = 640; image.height = 480; image.loading = 'lazy';
    const label = document.createElement('span'); label.textContent = step.label;
    button.append(image, label);
    button.addEventListener('click', () => selectAnalysisStep(i));
    stepsContainer.append(button);
  });
  const quote = document.querySelector('#note-quote');
  quote.textContent = data.quote;
  window.MemoirInk?.refresh(quote);
  selectAnalysisStep(0, animate);
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectNote(tab));
  tab.addEventListener('keydown', e => {
    let target;
    if (e.key === 'ArrowRight') target = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') target = (i + tabs.length - 1) % tabs.length;
    if (e.key === 'Home') target = 0;
    if (e.key === 'End') target = tabs.length - 1;
    if (target !== undefined) { e.preventDefault(); tabs[target].focus(); selectNote(tabs[target]); }
  });
});
selectNote(tabs[0], false);

if ('IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
  }, { threshold: .07, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
const chapterSections = [...document.querySelectorAll('[data-memory]')];
const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
let scrollTick = false, lastChapter = '';
function trackReading() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.reading-progress i').style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
  let current = '';
  for (const section of chapterSections) if (section.getBoundingClientRect().top < innerHeight * .43) current = section.id;
  if (current && current !== lastChapter) {
    lastChapter = current;
    for (const link of chapterLinks) {
      const active = link.dataset.chapter === current;
      link.setAttribute('aria-current', String(active));
      if (active && innerWidth < 761) {
        const nav = link.parentElement;
        nav.scrollTo({ left: link.offsetLeft - nav.clientWidth / 2 + link.clientWidth / 2, behavior: motionPaused ? 'auto' : 'smooth' });
      }
    }
  }
  scrollTick = false;
}
addEventListener('scroll', () => { if (!scrollTick) { requestAnimationFrame(trackReading); scrollTick = true; } }, { passive: true });
addEventListener('resize', trackReading, { passive: true });
trackReading();
const hero = document.querySelector('.hero'), collage = document.querySelector('.hero-collage');
hero.addEventListener('pointermove', e => {
  if (motionPaused || e.pointerType !== 'mouse' || innerWidth < 1100) return;
  cancelAnimationFrame(collageFrame);
  collageFrame = requestAnimationFrame(() => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    collage.style.transform = `translate(${x * 4}px,${y * 3}px)`;
  });
});
hero.addEventListener('pointerleave', () => { cancelAnimationFrame(collageFrame); collage.style.transform = 'none'; });
const count = document.querySelector('[data-count]');
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      counterObserver.disconnect();
      if (motionPaused) return;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / 900, 1);
        count.textContent = (900.3 * (1 - Math.pow(1 - p, 3))).toFixed(1);
        if (p < 1 && !motionPaused) requestAnimationFrame(step); else count.textContent = '900.3';
      }
      requestAnimationFrame(step);
    }
  }, { threshold: .7 });
  counterObserver.observe(count);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuButton.focus(); }
});

// Only confirmed credit information is shown. Empty fields remain editable.
const credit = window.MEMOIR_CREDIT || {};
const roles = Array.isArray(credit.roles) ? credit.roles.filter(Boolean).join(' · ') : '';
if (credit.name || roles) {
  document.querySelector('.project-credit').hidden = false;
  document.querySelector('#project-role').textContent = roles;
  document.querySelector('#project-credit-name').textContent = credit.name || '';
  document.querySelector('#creator').hidden = false;
  document.querySelector('#creator-title').textContent = credit.name || '创作职责';
  document.querySelector('#creator-role').textContent = roles;
  if (credit.contactUrl && /^(https?:\/\/|mailto:|tel:)/i.test(credit.contactUrl)) {
    const contact = document.querySelector('#creator-contact');
    contact.hidden = false; contact.href = credit.contactUrl; contact.textContent = credit.contactLabel || '联系作者';
  }
}
