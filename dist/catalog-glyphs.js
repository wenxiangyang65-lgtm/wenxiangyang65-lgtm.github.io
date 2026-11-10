/* Sample the title silhouettes onto a grid of real text glyphs. */
window.initializeCatalogGlyphs = function (reduced) {
  const cover = document.querySelector('.catalog-letter-cover');
  const art = cover.querySelector('.catalog-letter-art');
  const canvas = art.querySelector('canvas');
  const compose = art.querySelector('.catalog-compose');
  const context = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const ink = mask.getContext('2d', {willReadFrequently: true});
  if (!context || !ink) return;

  const characters = '01020256{}[]/';
  let dots = [];
  let width = 0;
  let height = 0;
  let density = 1;
  let progress = reduced.matches ? 1 : 0;
  let animation = 0;
  let queued = 0;
  let started = false;
  let pointer = null;
  const hover = {clientX: 0, clientY: 0, inside: false};
  const lens = {x: 0, y: 0, amount: 0};

  function drawTitle(text, family, weight, baseline, size, share) {
    ink.font = `${weight} ${size}px ${family}`;
    const metrics = ink.measureText(text);
    const span = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const scale = width * share / (span || metrics.width);
    ink.save();
    ink.translate(width * (1 - share) / 2, height * baseline);
    ink.scale(scale, 1);
    ink.fillText(text, metrics.actualBoundingBoxLeft, 0);
    ink.restore();
  }

  function resample() {
    const rect = art.getBoundingClientRect();
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    if (!width || !height) return;
    density = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = Math.ceil(width * density);
    canvas.height = Math.ceil(height * density);
    mask.width = width;
    mask.height = height;
    ink.fillStyle = '#000';
    drawTitle('AI Visual', 'Georgia, serif', 700, .47, height * .52, .96);
    drawTitle('Portfolio', '"Snell Roundhand", "Segoe Script", cursive', 600, .79, height * .63, .94);
    const pixels = ink.getImageData(0, 0, width, height).data;
    const pitch = Math.max(3, Math.round(width / 184));
    dots = [];
    for (let y = pitch; y < height - pitch; y += pitch) {
      for (let x = pitch; x < width - pitch; x += pitch * .72) {
        const ix = Math.round(x);
        if (pixels[(y * width + ix) * 4 + 3] < 120) continue;
        const seed = ((ix * 37 + y * 113) % 997) / 997;
        dots.push({
          x, y,
          sx: width * (.1 + ((ix * 61 + y * 7) % 997) / 1246),
          sy: height * (.18 + ((ix * 13 + y * 37) % 991) / 1510),
          seed,
          glyph: characters[(ix * 7 + y * 13) % characters.length]
        });
      }
    }
    if (!dots.length) return;
    context.setTransform(density, 0, 0, density, 0, 0);
    context.font = `600 ${pitch * .96}px ui-monospace, Menlo, monospace`;
    context.textBaseline = 'middle';
    context.fillStyle = '#111';
    art.classList.add('has-glyphs');
    compose.hidden = reduced.matches;
    queueDraw();
  }

  function draw() {
    queued = 0;
    if (!width || !dots.length) return;
    const rect = cover.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top > innerHeight || !rect.height) {
      lens.amount = 0;
      return;
    }
    const exit = reduced.matches ? 0 : Math.max(0, Math.min(1, -rect.top / (rect.height * .68)));
    const settled = progress * (2 - progress);
    const follow = updateLens(exit);
    const radius = Math.max(42, Math.min(112, width * .117)) * .4;
    const radiusSquared = radius * radius;
    context.clearRect(0, 0, width, height);
    for (const dot of dots) {
      // At rest the dots make a legible wordmark. On exit, the grid breaks into short streams.
      const opacity = (dot.seed < .06 ? .8 : Math.max(0, (settled - dot.seed * .58) / .42)) * (1 - exit);
      if (opacity < .04) continue;
      context.globalAlpha = Math.min(1, opacity);
      const x = dot.sx + (dot.x - dot.sx) * settled + (dot.seed - .5) * width * exit * .28;
      const y = dot.sy + (dot.y - dot.sy) * settled + (dot.seed - .24) * height * exit * .6;
      const dx = x - lens.x;
      const dy = y - lens.y;
      const distanceSquared = dx * dx + dy * dy;
      if (lens.amount > .015 && distanceSquared < radiusSquared) {
        const falloff = 1 - distanceSquared / radiusSquared;
        const strength = lens.amount * falloff * falloff;
        const magnification = 1 + 1.45 * strength;
        context.save();
        context.translate(x + dx * strength * .66, y + dy * strength * .66);
        context.scale(magnification, magnification);
        context.fillText(dot.glyph, 0, 0);
        context.restore();
      } else context.fillText(dot.glyph, x, y);
    }
    context.globalAlpha = 1;
    if (follow) queueDraw();
  }

  function updateLens(exit) {
    const active = hover.inside && !pointer && !reduced.matches && progress >= .97 && exit < .35;
    const target = active ? 1 : 0;
    let followsPointer = false;
    if (active) {
      const rect = art.getBoundingClientRect();
      const x = hover.clientX - rect.left;
      const y = hover.clientY - rect.top;
      if (lens.amount < .015) {
        lens.x = x;
        lens.y = y;
      } else {
        lens.x += (x - lens.x) * .23;
        lens.y += (y - lens.y) * .23;
      }
      followsPointer = Math.abs(x - lens.x) + Math.abs(y - lens.y) > .3;
    }
    lens.amount += (target - lens.amount) * .18;
    if (Math.abs(target - lens.amount) < .015) lens.amount = target;
    return followsPointer || target !== lens.amount;
  }

  function queueDraw() {
    if (!queued) queued = requestAnimationFrame(draw);
  }

  function finish(duration = 420) {
    cancelAnimationFrame(animation);
    if (progress >= 1) return;
    const from = progress;
    const start = performance.now();
    function tick(now) {
      const amount = Math.min(1, (now - start) / duration);
      progress = from + (1 - from) * amount;
      queueDraw();
      if (amount < 1) animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  }

  new ResizeObserver(resample).observe(art);
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    queueDraw();
    if (!started && !reduced.matches) {
      started = true;
      setTimeout(() => { if (!pointer) finish(820); }, 230);
    }
    observer.disconnect();
  }, {threshold: .18}).observe(cover);
  window.addEventListener('scroll', queueDraw, {passive: true});
  art.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reduced.matches) return;
    hover.inside = true;
    hover.clientX = event.clientX;
    hover.clientY = event.clientY;
    queueDraw();
  });
  art.addEventListener('pointerleave', () => {
    hover.inside = false;
    queueDraw();
  });
  compose.addEventListener('click', () => finish());
  compose.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || progress >= 1) return;
    cancelAnimationFrame(animation);
    pointer = {id: event.pointerId, x: event.clientX, start: progress};
    compose.setPointerCapture(event.pointerId);
  });
  compose.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    progress = Math.min(1, pointer.start + Math.abs(event.clientX - pointer.x) / (width * .36));
    queueDraw();
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    compose.addEventListener(name, event => {
      if (pointer?.id !== event.pointerId) return;
      pointer = null;
      finish();
    });
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelAnimationFrame(animation);
      progress = 1;
    }
    compose.hidden = reduced.matches;
    queueDraw();
  });

  const typeset = document.querySelector('.catalog-typeset');
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    typeset.classList.add('is-reassembled');
    observer.disconnect();
  }, {threshold: .23}).observe(typeset);
};
