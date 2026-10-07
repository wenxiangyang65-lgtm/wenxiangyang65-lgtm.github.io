(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reading-progress');
  const tools = document.querySelector('.browse-tools');
  const menu = document.querySelector('.chapter-index');
  const toggle = document.querySelector('.index-toggle');
  const current = document.querySelector('.current-chapter');
  const links = [...menu.querySelectorAll('a')];
  const chapters = links.map(link => ({element:document.querySelector(link.hash),link,label:link.firstChild.textContent}));
  const nearby = new Set();
  let queued = false;

  function setMenu(open, returnFocus = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (returnFocus) toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });

  function update() {
    queued = false;
    const viewport = window.innerHeight;
    const length = document.documentElement.scrollHeight - viewport;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1,window.scrollY/length) : 0})`;
    tools.hidden = window.scrollY < Math.min(220, viewport*.35);
    let active = null;
    for (const chapter of chapters) {
      if (chapter.element.getBoundingClientRect().top <= viewport*.4) active = chapter;
    }
    current.textContent = active?.label || '年货为你而来';
    links.forEach(link => {
      if (link === active?.link) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    if (!reduceMotion.matches) {
      for (const hero of nearby) {
        const rect = hero.getBoundingClientRect();
        const center = rect.top + rect.height/2;
        const drift = Math.max(-1,Math.min(1,(viewport/2-center)/viewport)) * Math.min(22,window.innerWidth*.035);
        hero.style.setProperty('--drift',`${drift.toFixed(1)}px`);
      }
    }
  }
  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  if ('IntersectionObserver' in window) {
    const parallax = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? nearby.add(entry.target) : nearby.delete(entry.target));
      queue();
    },{rootMargin:'100px'});
    document.querySelectorAll('.hero:not(.water)').forEach(hero => parallax.observe(hero));
    if (!reduceMotion.matches) {
      document.documentElement.classList.add('motion-ready');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        });
      },{threshold:.12});
      document.querySelectorAll('.scene-title,.concept-note,.closing,.system-intro,.color-system,.image-callout').forEach(element => reveal.observe(element));
    }
  }
  reduceMotion.addEventListener('change', () => {
    document.documentElement.classList.toggle('motion-ready',!reduceMotion.matches);
    document.querySelectorAll('.hero').forEach(hero => hero.style.removeProperty('--drift'));
    queue();
  });
  update();
})();
