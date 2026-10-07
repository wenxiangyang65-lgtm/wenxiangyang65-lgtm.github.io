'use strict';
(() => {
  if (window.MemoirInk) return;
  const selector = '.handwritten, .brand-mark, #hero-title .title-adversity, #hero-title .title-within, #hero-title .title-open, #hero-title .title-flower';
  const closing = /^[，。！？、；：）》」』”’…,.!?;:]$/u;
  const stops = /^[，。！？、；：,.!?;:]$/u;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  const canAnimate = typeof Element.prototype.animate === 'function' &&
    typeof IntersectionObserver === 'function' && CSS.supports('clip-path', 'polygon(0 0,100% 0,100% 100%)');
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }) : null;
  const characters = text => segmenter ? [...segmenter.segment(text)].map(s => s.segment) : Array.from(text);
  const paused = () => reducedMotion.matches || document.body.classList.contains('motion-paused');
  const isVisible = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 15 && r.top < innerHeight - 20;
  };

  function clearAnimations(state) {
    state.run += 1;
    for (const animation of state.animations) animation.cancel();
    state.animations = [];
  }
  function finish(state, markSeen = true) {
    clearAnimations(state);
    state.el.dataset.inkState = 'complete';
    if (markSeen) state.seen = true;
  }

  function prepare(el) {
    if (states.has(el)) return states.get(el);
    const text = el.textContent;
    if (!text.trim()) return null;
    const state = { el, glyphs: [], animations: [], seen: false, run: 0, hero: Boolean(el.closest('#hero-title')) };
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let pauseBefore = 0;
    let previousNode = null;
    for (const node of nodes) {
      // Existing line breaks stay in the document and receive a short breath.
      if (previousNode && node.previousSibling?.nodeName === 'BR') pauseBefore += 130;
      const fragment = document.createDocumentFragment();
      let unit = null;
      for (const character of characters(node.nodeValue)) {
        if (/^\s+$/u.test(character)) {
          fragment.append(document.createTextNode(character));
          pauseBefore += 40;
          unit = null;
          continue;
        }
        // Keep closing punctuation attached to its preceding character on mobile.
        if (!closing.test(character) || !unit) {
          unit = document.createElement('span');
          unit.className = 'ink-unit';
          unit.setAttribute('aria-hidden', 'true');
          fragment.append(unit);
        }
        const glyph = document.createElement('span');
        glyph.className = 'ink-glyph';
        glyph.textContent = character;
        unit.append(glyph);
        state.glyphs.push({ el: glyph, character, pauseBefore });
        pauseBefore = stops.test(character) ? 115 : 0;
      }
      previousNode = node;
      node.replaceWith(fragment);
    }
    // One continuous accessible sentence instead of individually spoken letters.
    const accessible = document.createElement('span');
    accessible.className = 'ink-accessible';
    accessible.textContent = text;
    el.prepend(accessible);
    el.classList.add('ink-host');
    el.dataset.inkState = paused() ? 'complete' : 'armed';
    states.set(el, state);
    return state;
  }

  function play(state) {
    if (!state || paused() || !canAnimate) {
      if (state) finish(state, false);
      return;
    }
    clearAnimations(state);
    const run = state.run;
    state.seen = true;
    state.el.dataset.inkState = 'writing';
    const length = state.glyphs.length;
    const chapterTitle = Boolean(state.el.closest('.memory-name'));
    const closingTitle = Boolean(state.el.closest('.closing-copy'));
    const heading = /^H[1-6]$/.test(state.el.tagName);
    let delay = state.hero ? 140 : heading ? 180 : 350;
    if (state.hero) {
      const ordered = ['title-adversity', 'title-within', 'title-open', 'title-flower'];
      delay += Math.max(0, ordered.findIndex(c => state.el.classList.contains(c))) * 250;
    }
    // Short titles feel unhurried; a long note still completes in a few seconds.
    const step = state.hero ? 190 : chapterTitle ? 150 : closingTitle ? 95 : Math.max(35, Math.min(80, 900 / Math.max(length, 1)));
    for (const [index, glyph] of state.glyphs.entries()) {
      delay += glyph.pauseBefore;
      const punctuation = stops.test(glyph.character);
      const duration = punctuation ? 150 : (state.hero ? 740 : chapterTitle ? 620 : closingTitle ? 930 : heading ? 600 : 450) + (index % 3) * 25;
      // A softly irregular diagonal ink front preserves the actual calligraphy.
      // This is an expressive reveal, not a claim of exact Chinese stroke order.
      const forward = index % 3 !== 1;
      const middleA = forward ? 'polygon(-15% -15%,36% -15%,9% 115%,-15% 115%)' : 'polygon(-15% -15%,9% -15%,36% 115%,-15% 115%)';
      const middleB = forward ? 'polygon(-15% -15%,82% -15%,54% 115%,-15% 115%)' : 'polygon(-15% -15%,54% -15%,82% 115%,-15% 115%)';
      try {
        const animation = glyph.el.animate([
          { clipPath: 'polygon(-15% -15%,-15% -15%,-15% 115%,-15% 115%)', opacity: 0.08, filter: 'blur(.7px)', offset: 0 },
          { clipPath: middleA, opacity: 0.84, filter: 'blur(.35px)', offset: 0.31 },
          { clipPath: middleB, opacity: 1, filter: 'blur(.12px)', offset: 0.7 },
          { clipPath: 'polygon(-15% -15%,115% -15%,115% 115%,-15% 115%)', opacity: 1, filter: 'blur(0px)', offset: 1 }
        ], { duration, delay, easing: 'cubic-bezier(.28,.08,.24,1)', fill: 'both' });
        // Cancellation can happen mid-loop if a later glyph cannot animate.
        // Attach a rejection handler immediately, including that fallback path.
        animation.finished.catch(() => {});
        state.animations.push(animation);
      } catch {
        finish(state);
        return;
      }
      delay += punctuation ? 95 : step + [0, 24, -12, 36][index % 4];
    }
    Promise.allSettled(state.animations.map(a => a.finished)).then(() => {
      if (state.run === run) finish(state);
    });
  }

  const observer = canAnimate ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.get(entry.target);
      if (entry.isIntersecting && state && !state.seen && !paused()) play(state);
    }
  }, { threshold: 0.32, rootMargin: '0px 0px -24px 0px' }) : null;

  function refresh(el) {
    if (!el || !canAnimate) return;
    const old = states.get(el);
    if (old) {
      clearAnimations(old);
      observer.unobserve(el);
      states.delete(el);
    }
    // refresh is called after the tab writes new plain text into the note.
    const state = prepare(el);
    if (!state) return;
    if (isVisible(el)) play(state);
    observer.observe(el);
  }

  function synchronizeMotion() {
    for (const state of states.values()) {
      if (paused()) finish(state, false);
      else if (isVisible(state.el)) play(state);
      else if (!state.seen) state.el.dataset.inkState = 'armed';
    }
  }

  function initialize() {
    if (!canAnimate) return; // The unchanged original text is the fallback.
    document.querySelectorAll(selector).forEach(el => prepare(el));
    const fonts = document.fonts?.ready || Promise.resolve();
    Promise.race([fonts, new Promise(resolve => setTimeout(resolve, 800))]).then(() => {
      for (const state of states.values()) observer.observe(state.el);
    });
    document.addEventListener('memoir:motionchange', synchronizeMotion);
    reducedMotion.addEventListener?.('change', synchronizeMotion);
    addEventListener('beforeprint', () => states.forEach(state => finish(state, false)));
    // Returning from a background tab must never leave a half-written heading.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) for (const state of states.values()) {
        if (state.el.dataset.inkState === 'writing') finish(state);
      }
    });
  }

  window.MemoirInk = { refresh };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
