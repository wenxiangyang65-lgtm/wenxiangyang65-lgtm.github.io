'use strict';
// A shared motivation connects separate events; each pair keeps its own film time.
const conceptData = [
 { seconds:[3,30.5], captions:['被母亲牵住','为母亲筹医药费'], era:'童年 — 2008', heading:'从被照顾，到想照顾母亲。', quote:'最初，是为了妈妈。', chapters:'对应章节 · 牵挂 / 谋生', description:'童年时母亲生病，父亲承担家用。长大后，她在餐厅驻唱、做服装生意，为母亲筹集医药费。后面的谋生与创业，由这份牵挂开始。', shotNote:'镜头线索：开篇先看见母亲牵住孩子的手，随后转向驻唱与劳动，人物从被照顾的一方走向主动付出。' },
 { seconds:[93.5,140.5], captions:['卖车，筹资再出发','以母亲之名重建'], era:'2013 — 2014', heading:'两次跌落，母亲仍在故事里。', quote:'跌落之后，还要再站起来。', chapters:'对应章节 · 背弃 / 南下 / 重建', description:'合伙人背叛后，她卖车筹资，独自南下；进入化妆品行业后又遭遇黑心工厂。重振旗鼓时，她创立与母亲同名的 ZUZU 品牌，让新的开始仍与母亲相连。', shotNote:'镜头线索：手机上的卖车信息与重建后的品牌门头形成前后对照，中间经历告别、进厂与低谷夜晚。' },
 { seconds:[186.5,237.5], captions:['孩子握住她的手指','接过后辈递来的茶'], era:'2018 — 2026', heading:'把收到的关怀，传给后来的人。', quote:'从被牵住，到托住别人。', chapters:'对应章节 · 相守 / 再起', description:'女儿出生后，她成为被孩子依靠的人。影片后段，徐杰递上拜师的茶盏，照顾与支持延伸到后辈。最后回到母亲的病床与童年牵手，人物走过的路与最初的牵挂重新相接。', shotNote:'镜头线索：婴儿握住手指与拜师递接茶盏，分别表现亲子与托举关系；它们共同呼应开篇的牵手。' }
];
const conceptTabs = [...document.querySelectorAll('[data-concept]')];
document.querySelector('.concept-tabs').setAttribute('aria-orientation', 'vertical');
function chooseConcept(index) {
  const data = conceptData[index];
  conceptTabs.forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
  });
  document.querySelector('#concept-panel').setAttribute('aria-labelledby', conceptTabs[index].id);
  data.seconds.forEach((seconds, i) => {
    const frame = frames.find(item => item.seconds === seconds);
    const image = document.querySelector(`#concept-image-${i}`);
    image.src = `assets/${frame.id}-hd.webp`;
    image.alt = frame.name;
    document.querySelector(`#concept-frame-${i}`).dataset.seconds = String(seconds);
    document.querySelector(`#concept-frame-${i}`).setAttribute('aria-label', `放大：${frame.name}`);
    document.querySelector(`#concept-caption-${i}`).textContent = data.captions[i];
    document.querySelector(`#concept-time-${i}`).textContent = frame.time;
    if (!motionPaused && image.animate) image.animate([{ opacity:.4 },{ opacity:1 }], { duration:450, easing:'ease-out' });
  });
  document.querySelector('#concept-era').textContent = data.era;
  document.querySelector('#concept-heading').textContent = data.heading;
  document.querySelector('#concept-quote').textContent = data.quote;
  window.MemoirInk?.refresh(document.querySelector('#concept-quote'));
  document.querySelector('#concept-description').textContent = data.description;
  document.querySelector('#concept-shot-note').textContent = data.shotNote;
  document.querySelector('#concept-chapters').textContent = data.chapters;
  document.querySelector('#concept-play').dataset.filmTime = String(data.seconds[0]);
  document.querySelector('#concept-time').textContent = frames.find(item => item.seconds === data.seconds[0]).time;
}
conceptTabs.forEach((button, i) => {
  button.addEventListener('click', () => chooseConcept(i));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (i + 1) % conceptTabs.length;
    if (event.key === 'ArrowLeft') next = (i + conceptTabs.length - 1) % conceptTabs.length;
    if (event.key === 'ArrowDown') next = (i + 1) % conceptTabs.length;
    if (event.key === 'ArrowUp') next = (i + conceptTabs.length - 1) % conceptTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = conceptTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); chooseConcept(next); conceptTabs[next].focus(); }
  });
});

const distanceScroll = document.querySelector('#distance-scroll');
const distanceRange = document.querySelector('#distance-range');
const distanceStage = document.querySelector('.distance-stage');
let distanceManual = false, distanceScheduled = false;
function setDistance(value) {
  const progress = Math.max(0, Math.min(1, value));
  distanceStage.style.setProperty('--distance-progress', String(progress));
  distanceRange.value = String(Math.round(progress * 100));
  const label = progress < .33 ? '先留下，手的触感。' : progress < .67 ? '松开之后，距离慢慢拉开。' : '人变小了，牵挂没有。';
  document.querySelector('#distance-label').textContent = label;
  distanceRange.setAttribute('aria-valuetext', `${Math.round(progress * 100)}%，${label}`);
}
distanceRange.addEventListener('input', () => { distanceManual = true; setDistance(Number(distanceRange.value) / 100); });
function updateDistance() {
  distanceScheduled = false;
  document.querySelector('.distance-hint').textContent = (innerWidth < 761 || motionPaused) ? '拖动滑杆，在近景与远景之间切换。' : '向下滚动，或拖动滑杆，感受离别的距离。';
  const rect = distanceScroll.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) { distanceManual = false; return; }
  if (motionPaused || distanceManual || innerWidth < 761) return;
  const run = Math.max(1, rect.height - innerHeight);
  setDistance((110 - rect.top) / run);
}
addEventListener('scroll', () => {
  if (!distanceScheduled) { distanceScheduled = true; requestAnimationFrame(updateDistance); }
}, { passive: true });
addEventListener('resize', updateDistance, { passive: true });

const heroLoop = document.querySelector('.hero-loop');
let heroInView = true;
function syncHeroMotion() {
  if (!heroLoop) return;
  if (motionPaused || document.hidden || !heroInView) { heroLoop.pause(); return; }
  heroLoop.play().catch(() => {});
}
document.addEventListener('memoir:motionchange', () => {
  distanceScroll.classList.toggle('distance-static', motionPaused);
  syncHeroMotion(); updateDistance();
});
document.addEventListener('visibilitychange', syncHeroMotion);
if (heroLoop && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { heroInView = entries[0].isIntersecting; syncHeroMotion(); }, { threshold: .05 });
  observer.observe(heroLoop);
}
heroLoop?.addEventListener('error', () => { heroLoop.hidden = true; });
distanceScroll.classList.toggle('distance-static', motionPaused);
syncHeroMotion(); updateDistance();
