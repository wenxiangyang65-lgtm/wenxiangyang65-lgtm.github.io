/* Operations have one canvas fit; never combine CSS zoom with a mobile viewport scale. */
(() => {
  const root = document.documentElement;
  if (!root.hasAttribute('data-operations-preview')) return;
  if (new URLSearchParams(location.search).has('static')) return;

  const authored = document.querySelector('article.board[data-case]');
  let canvas = authored;
  const fluid = !authored;
  if (fluid) {
    if (!document.querySelector('.case-board')) return;
    canvas = document.createElement('div');
    for (const child of Array.from(document.body.children)) {
      if (child.matches('header,main,section.motion,footer')) canvas.append(child);
    }
    document.body.prepend(canvas);
  }
  canvas.classList.add('operations-canvas');
  const stage = document.createElement('div');
  stage.className = 'operations-viewport';
  canvas.before(stage);
  stage.append(canvas);

  const style = document.createElement('style');
  style.textContent = `
    html[data-operations-preview],html[data-operations-preview] body{overflow-x:hidden;-webkit-text-size-adjust:none;text-size-adjust:none}
    .operations-viewport{position:relative;width:100%;margin-inline:auto;overflow:hidden}
    .operations-canvas{transform-origin:0 0;-webkit-text-size-adjust:none;text-size-adjust:none}
    html[data-operations-fluid-fit] .operations-canvas h1{font-size:26px}
    html[data-operations-fluid-fit] .operations-canvas .motion video{max-height:729px}
  `;
  document.head.append(style);

  let scheduled = false;
  function fit() {
    scheduled = false;
    const width = document.documentElement.clientWidth;
    if (!width) return;
    const touch = navigator.maxTouchPoints > 0 || matchMedia('(pointer:coarse)').matches;
    const fitFluid = fluid && (width <= 600 || (touch && Math.min(screen.width,screen.height) <= 1024));
    if (fluid && !fitFluid) {
      root.removeAttribute('data-operations-fluid-fit');
      stage.style.cssText = 'display:contents';
      canvas.style.cssText = 'display:contents';
      root.dataset.operationsFitReady = 'true';
      return;
    }
    root.toggleAttribute('data-operations-fluid-fit', fitFluid);
    const designWidth = fluid ? 1440 : 1600;
    const scale = Math.min(1,width/designWidth);
    // Keep the current flow height while images load; clearing it can reset Safari's scroll position.
    Object.assign(stage.style, {display:'block',maxWidth:designWidth+'px'});
    Object.assign(canvas.style, {display:'block',position:'absolute',left:'0',top:'0',width:designWidth+'px',margin:'0',zoom:'1',transform:`scale(${scale})`});
    stage.style.height = Math.ceil(Math.max(canvas.offsetHeight,canvas.scrollHeight)*scale)+'px';
    root.style.setProperty('--operations-canvas-scale',String(scale));
    root.dataset.operationsFitReady = 'true';
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(fit);
    }
  }
  fit();
  addEventListener('resize',schedule);
  addEventListener('orientationchange',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('load',schedule,true);
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(canvas);
})();
