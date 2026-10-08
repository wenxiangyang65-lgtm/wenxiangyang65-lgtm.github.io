/* Keep the authored desktop composition on touch devices; retain native pinch zoom. */
(() => {
  const reserveArtwork = () => {
    document.querySelectorAll('img[data-preview-aspect]').forEach(image => {
      if (getComputedStyle(image).aspectRatio === 'auto') image.style.aspectRatio = `auto ${image.dataset.previewAspect}`;
    });
  };
  document.addEventListener('DOMContentLoaded', reserveArtwork, {once:true});
  const touch = navigator.maxTouchPoints > 0 || matchMedia('(pointer:coarse)').matches || /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
  if (!touch || Math.min(screen.width, screen.height) > 1024) return;
  const root = document.documentElement;
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;
  const layoutWidth = 1440;
  const fit = () => {
    const physicalWidth = window.outerWidth || screen.width;
    const scale = physicalWidth / layoutWidth;
    const landscape = physicalWidth > Math.min(screen.width, screen.height) * 1.15 || Math.abs(window.orientation || 0) === 90 || (screen.orientation?.type || '').startsWith('landscape');
    const physicalHeight = (window.visualViewport && window.visualViewport.height * window.visualViewport.scale) || window.innerHeight || (landscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height));
    root.style.setProperty('--portfolio-preview-screen-height', `${physicalHeight / scale}px`);
    const content = `width=${layoutWidth},initial-scale=${scale},maximum-scale=8,user-scalable=yes`;
    document.querySelectorAll('meta[name=viewport]').forEach(meta => { if (meta.content !== content) meta.content = content; });
    root.style.setProperty('--portfolio-preview-scale', String(scale));
    root.style.setProperty('--portfolio-preview-vmax', `${layoutWidth / 100}px`);
    root.style.setProperty('--portfolio-preview-vh', `${layoutWidth * 9 / 16 / 100}px`);
  };
  root.dataset.previewLayout = 'desktop';
  fit();
  new MutationObserver(() => { if (!viewport.content.includes('width=1440')) fit(); }).observe(viewport, {attributes:true,attributeFilter:['content']});
  const unit = /(-?(?:\d*\.)?\d+)((?:s|d|l)?vh|vmin|vmax)\b/g;
  const adaptValue = value => (value.includes('--portfolio-preview-vh') || /url\(/i.test(value)) ? value : value.replace(unit, (_, n, kind) => `calc(${n} * var(${kind === 'vmax' ? '--portfolio-preview-vmax' : '--portfolio-preview-vh'}))`);
  const declarations = style => {
    for (const property of Array.from(style)) {
      const value = style.getPropertyValue(property);
      const next = adaptValue(value);
      if (next !== value) style.setProperty(property, next, style.getPropertyPriority(property));
    }
  };
  const visited = new WeakSet();
  const rules = list => {
    for (const rule of Array.from(list)) {
      if (visited.has(rule)) continue;
      visited.add(rule);
      if (rule.style) declarations(rule.style);
      if (rule.cssRules) rules(rule.cssRules);
    }
  };
  const sheets = () => {
    for (const sheet of Array.from(document.styleSheets)) {
      if (sheet.ownerNode?.dataset?.previewControls) continue;
      try { rules(sheet.cssRules); } catch { /* Cross-origin font sheets do not control layout. */ }
    }
  };
  const controls = document.createElement('style');
  controls.dataset.previewControls = 'true';
  controls.textContent = `html[data-preview-layout="desktop"]{-webkit-text-size-adjust:100%;text-size-adjust:100%}
html[data-preview-layout="desktop"] .screen{min-height:var(--portfolio-preview-screen-height)!important}
html[data-preview-layout="desktop"] .artframe{width:min(100%,calc(var(--portfolio-preview-screen-height) * 1.77777778))}
html[data-preview-layout="desktop"] .portfolio-return{left:calc(12px / var(--portfolio-preview-scale))!important;bottom:calc(12px / var(--portfolio-preview-scale))!important;gap:calc(7px / var(--portfolio-preview-scale))!important;padding:calc(9px / var(--portfolio-preview-scale)) calc(12px / var(--portfolio-preview-scale))!important;font-size:calc(13px / var(--portfolio-preview-scale))!important}
html[data-preview-layout="desktop"] .portfolio-return-disc{width:calc(19px / var(--portfolio-preview-scale))!important;height:calc(19px / var(--portfolio-preview-scale))!important}
html[data-preview-layout="desktop"] .portfolio-return-disc:after{width:calc(4px / var(--portfolio-preview-scale))!important;height:calc(4px / var(--portfolio-preview-scale))!important}
html[data-preview-layout="desktop"] .page-dots{right:calc(5px / var(--portfolio-preview-scale));gap:calc(8px / var(--portfolio-preview-scale))}
html[data-preview-layout="desktop"] .page-dots a{width:calc(28px / var(--portfolio-preview-scale));height:calc(28px / var(--portfolio-preview-scale))}
html[data-preview-layout="desktop"] .page-dots a:before{width:calc(4px / var(--portfolio-preview-scale));height:calc(4px / var(--portfolio-preview-scale))}
html[data-preview-layout="desktop"] .album-button{position:relative}
html[data-preview-layout="desktop"] .album-button:before{content:"";position:absolute;inset:calc(-9px / var(--portfolio-preview-scale)) calc(-6px / var(--portfolio-preview-scale))}
html[data-preview-layout="desktop"] .hotspot:before{content:"";position:absolute;inset:-20px 0}
html[data-preview-layout="desktop"] .scroll-cue:before{content:"";position:absolute;inset:calc(-16px / var(--portfolio-preview-scale)) calc(-10px / var(--portfolio-preview-scale))}
html[data-preview-layout="desktop"] .tooltip{display:none}
html[data-preview-layout="desktop"] .portfolio-source-hint{right:calc(12px / var(--portfolio-preview-scale))!important;bottom:calc(12px / var(--portfolio-preview-scale))!important;font-size:calc(11px / var(--portfolio-preview-scale))!important;padding:calc(8px / var(--portfolio-preview-scale))!important}
`;
  document.head.append(controls);
  document.addEventListener('load', event => {
    if (event.target?.tagName === 'LINK') sheets();
  }, true);
  new MutationObserver(entries => {
    if (entries.some(entry => Array.from(entry.addedNodes).some(node => node.nodeType === 1 && /^(STYLE|LINK)$/.test(node.tagName)))) sheets();
    if (Array.from(document.querySelectorAll('meta[name=viewport]')).some(meta => !meta.content.includes('width=1440'))) fit();
  }).observe(document.head, {childList:true,subtree:true,attributes:true,attributeFilter:['content']});
  document.addEventListener('DOMContentLoaded', () => {
    fit();
    sheets();
    document.querySelectorAll('[style]').forEach(element => declarations(element.style));
    root.dataset.previewReady = 'true';
  }, {once:true});
  window.visualViewport?.addEventListener('resize', () => {
    const scale = Number(root.style.getPropertyValue('--portfolio-preview-scale'));
    const height = visualViewport.height * visualViewport.scale;
    if (scale && height) root.style.setProperty('--portfolio-preview-screen-height', `${height / scale}px`);
  });
  addEventListener('orientationchange', () => setTimeout(fit, 150));
})();
