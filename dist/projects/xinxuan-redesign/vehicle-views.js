(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const models = [...document.querySelectorAll('.vehicle-rotator')];
  const states = new Map();
  const gallery = document.querySelector('#image-viewer');

  models.forEach((model, order) => {
    const slides = [...model.querySelectorAll('.model-slide')];
    const tabs = [...model.querySelectorAll('.view-tab')];
    const toggle = model.querySelector('.rotation-toggle');
    const state = {index:0,visible:false,hover:false,focus:false,playing:!motion.matches,timer:null,delay:3900+order*200};
    states.set(model,state);

    function show(index) {
      state.index = (index+slides.length)%slides.length;
      slides.forEach((slide,position) => {
        const active = position === state.index;
        slide.classList.toggle('is-active',active);
        slide.inert = !active;
        slide.tabIndex = active ? 0 : -1;
        if (active) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden','true');
        tabs[position].setAttribute('aria-pressed',String(active));
      });
    }
    function synchronize() {
      clearTimeout(state.timer);
      state.timer = null;
      const canPlay = state.playing && state.visible && !state.hover && !state.focus && !document.hidden && !gallery.open;
      toggle.textContent = state.playing ? '暂停' : '播放';
      toggle.setAttribute('aria-pressed',String(state.playing));
      toggle.setAttribute('aria-label',`${state.playing?'暂停':'播放'}${model.dataset.vehicle}的自动切换`);
      if (!canPlay) return;
      state.timer = setTimeout(() => {
        show(state.index+1);
        synchronize();
      },state.delay);
    }
    state.synchronize = synchronize;
    state.loadViews = () => slides.forEach(slide => {slide.querySelector('img').loading='eager';});
    tabs.forEach((tab,index) => tab.addEventListener('click', () => {show(index);synchronize();}));
    toggle.addEventListener('click', () => {state.playing=!state.playing;synchronize();});
    model.addEventListener('pointerenter',event => {if(event.pointerType==='mouse'){state.hover=true;synchronize();}});
    model.addEventListener('pointerleave',event => {if(event.pointerType==='mouse'){state.hover=false;synchronize();}});
    model.addEventListener('focusin', event => {state.focus=event.target!==toggle;synchronize();});
    model.addEventListener('focusout', () => {
      queueMicrotask(() => {state.focus=model.contains(document.activeElement)&&document.activeElement!==toggle;synchronize();});
    });
    synchronize();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state=states.get(entry.target);
        state.visible=entry.isIntersecting;
        if(state.visible) state.loadViews();
        state.synchronize();
      });
    },{threshold:.15});
    models.forEach(model => observer.observe(model));
  } else {
    states.forEach(state => {state.visible=true;state.loadViews();state.synchronize();});
  }
  const synchronizeAll = () => states.forEach(state=>state.synchronize());
  document.addEventListener('visibilitychange',synchronizeAll);
  gallery.addEventListener('close',synchronizeAll);
  new MutationObserver(synchronizeAll).observe(gallery,{attributes:true,attributeFilter:['open']});
  motion.addEventListener('change', () => {
    states.forEach(state => {state.playing=!motion.matches;state.synchronize();});
  });
})();
