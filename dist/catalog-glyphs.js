/* Sample the title silhouettes onto a grid of real text glyphs. */
window.initializeCatalogGlyphs = function (reduced) {
  const catalog = document.querySelector('#catalog');
  const cover = catalog.querySelector('.catalog-letter-cover');
  const typeset = catalog.querySelector('.catalog-typeset');
  const rows = [...typeset.querySelectorAll('h3, .catalog-category-label')];
  const art = cover.querySelector('.catalog-letter-art');
  const canvas = art.querySelector('canvas');
  const compose = art.querySelector('.catalog-compose');
  const context = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const ink = mask.getContext('2d', {willReadFrequently: true});
  if (!context || !ink) return;
  const portfolio = new Image();
  let portfolioBounds = null;

  const transferCanvas = document.createElement('canvas');
  transferCanvas.className = 'catalog-transfer';
  transferCanvas.setAttribute('aria-hidden', 'true');
  const transferContext = transferCanvas.getContext('2d');
  if (transferContext) catalog.append(transferCanvas);

  const unit = value => Math.max(0, Math.min(1, value));
  let flights = [];
  let artOffsetX = 0;
  let artOffsetY = 0;
  let transferWidth = 0;
  let transferHeight = 0;
  let transferPainted = false;
  let lastTransfer = -1;

  const characters = '01020256{}[]/';
  let dots = [];
  let width = 0;
  let height = 0;
  let density = 1;
  let progress = reduced.matches ? 1 : 0;
  let animation = 0;
  let queued = 0;
  let started = false;
  let returning = false;
  let directoryScroll;
  let returnProgress = 0;
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

  function makeDot(x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    return {
      x, y,
      sx: width * (.1 + ((ix * 61 + iy * 7) % 997) / 1246),
      sy: height * (.18 + ((ix * 13 + iy * 37) % 991) / 1510),
      seed: ((ix * 37 + iy * 113) % 997) / 997,
      glyph: characters[(ix * 7 + iy * 13) % characters.length]
    };
  }

  function samplePortfolio(pitch) {
    const aspect = portfolio.naturalWidth / portfolio.naturalHeight;
    const artWidth = Math.max(1, Math.round(Math.min(width * .96, height * .57 * aspect)));
    const artHeight = Math.max(1, Math.round(artWidth / aspect));
    const left = Math.round((width - artWidth) / 2);
    const top = Math.round(Math.min(height * .45 - artHeight * .08, height * .99 - artHeight));
    portfolioBounds = [left, top, artWidth, artHeight];

    // Use patches of the original lettering as particles so the reference digits survive the lens and scatter.
    mask.width = artWidth;
    mask.height = artHeight;
    ink.drawImage(portfolio, 0, 0, artWidth, artHeight);
    const pixels = ink.getImageData(0, 0, artWidth, artHeight).data;
    const step = Math.max(2, Math.round(pitch * .72));
    const scaleX = portfolio.naturalWidth / artWidth;
    const scaleY = portfolio.naturalHeight / artHeight;
    for (let y = 0; y < artHeight; y += pitch) {
      const tileHeight = Math.min(pitch, artHeight - y);
      for (let x = 0; x < artWidth; x += step) {
        const tileWidth = Math.min(step, artWidth - x);
        let hasInk = false;
        for (let row = y; row < y + tileHeight && !hasInk; row++) {
          for (let col = x; col < x + tileWidth; col++) {
            if (pixels[(row * artWidth + col) * 4 + 3] < 9) continue;
            hasInk = true;
            break;
          }
        }
        if (!hasInk) continue;
        const dot = makeDot(left + x + tileWidth / 2, top + y + tileHeight / 2);
        dot.tile = [x * scaleX, y * scaleY, tileWidth * scaleX, tileHeight * scaleY, tileWidth, tileHeight];
        dots.push(dot);
      }
    }
  }

  function paintDot(dot, x, y) {
    if (!dot.tile) {
      context.fillText(dot.glyph, x, y);
      return;
    }
    const [sourceX, sourceY, sourceWidth, sourceHeight, tileWidth, tileHeight] = dot.tile;
    context.drawImage(portfolio, sourceX, sourceY, sourceWidth, sourceHeight,
      x - tileWidth / 2, y - tileHeight / 2, tileWidth, tileHeight);
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
    const hasPortfolio = portfolio.complete && portfolio.naturalWidth > 0;
    if (!hasPortfolio) drawTitle('Portfolio', '"Snell Roundhand", "Segoe Script", cursive', 600, .79, height * .63, .94);
    const pixels = ink.getImageData(0, 0, width, height).data;
    const pitch = Math.max(3, Math.round(width / 184));
    dots = [];
    portfolioBounds = null;
    for (let y = pitch; y < height - pitch; y += pitch) {
      for (let x = pitch; x < width - pitch; x += pitch * .72) {
        const ix = Math.round(x);
        if (pixels[(y * width + ix) * 4 + 3] < 120) continue;
        dots.push(makeDot(x, y));
      }
    }
    if (hasPortfolio) samplePortfolio(pitch);
    if (!dots.length) return;
    context.setTransform(density, 0, 0, density, 0, 0);
    context.font = `600 ${pitch * .96}px ui-monospace, Menlo, monospace`;
    context.textBaseline = 'middle';
    context.fillStyle = '#111';
    art.classList.add('has-glyphs');
    compose.hidden = reduced.matches;
    sampleDirectory(rect, pitch);
    queueDraw();
  }

  function sampleDirectory(artRect, pitch) {
    if (!transferContext) return;
    const frame = catalog.getBoundingClientRect();
    const directory = typeset.getBoundingClientRect();
    artOffsetX = artRect.left - frame.left;
    artOffsetY = artRect.top - frame.top;
    transferWidth = Math.ceil(frame.width);
    transferHeight = Math.ceil(directory.bottom - frame.top + 8);
    if (!transferWidth || transferHeight <= 0) return;

    const scale = Math.min(density, 1.25);
    transferCanvas.width = Math.ceil(transferWidth * scale);
    transferCanvas.height = Math.ceil(transferHeight * scale);
    transferCanvas.style.height = `${transferHeight}px`;
    transferContext.setTransform(scale, 0, 0, scale, 0, 0);
    transferContext.fillStyle = '#111';
    transferContext.textBaseline = 'middle';
    transferContext.font = `600 ${Math.max(2.8, pitch * .8)}px ui-monospace, Menlo, monospace`;

    const points = [];
    const step = Math.max(2, Math.round(pitch * .62));
    rows.forEach((row, index) => {
      const letters = row.querySelectorAll('.catalog-category-letter');
      const range = document.createRange();
      range.selectNodeContents(row);
      const bounds = range.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      // Measure each DOM letter so the small glyphs settle into the same positions as the live labels.
      const style = getComputedStyle(row);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      mask.width = Math.ceil(bounds.width) + 4;
      mask.height = Math.ceil(bounds.height) + 4;
      ink.font = font;
      ink.fillStyle = '#000';
      ink.textBaseline = 'middle';
      const mid = mask.height / 2;
      if (letters.length) {
        for (const letter of letters) {
          const position = letter.getBoundingClientRect();
          ink.fillText(letter.firstChild.data, position.left - bounds.left + 2, mid);
        }
      } else {
        ink.fillText(row.textContent, 2, mid);
      }
      const pixels = ink.getImageData(0, 0, mask.width, mask.height).data;
      for (let y = 1; y < mask.height; y += step) {
        for (let x = 1; x < mask.width; x += step) {
          if (pixels[(y * mask.width + x) * 4 + 3] < 115) continue;
          points.push({x: bounds.left - frame.left + x - 2, y: bounds.top - frame.top + y - 2, row: index});
        }
      }
    });
    const sources = [...dots].sort((a, b) => a.seed - b.seed);
    const count = Math.min(points.length, sources.length);
    flights = Array.from({length: count}, (_, i) => {
      const target = points[Math.floor(i * points.length / count)];
      const dot = sources[Math.floor(i * sources.length / count)];
      const delay = target.row * .028 + dot.seed * .11;
      dot.departure = delay;
      return {dot, target, delay};
    });
    transferPainted = false;
    lastTransfer = -1;
  }

  function drawTransfer(transfer, settled) {
    if (!flights.length) return;
    if (transfer !== lastTransfer) {
      rows.forEach((row, i) => {
        const inkAmount = unit((transfer - .67 - i * .029) / .145);
        row.style.setProperty('--catalog-row-ink', inkAmount.toFixed(3));
      });
      lastTransfer = transfer;
    }
    if (transfer <= 0 || transfer >= 1) {
      if (transferPainted) transferContext.clearRect(0, 0, transferWidth, transferHeight);
      transferPainted = false;
      return;
    }
    transferContext.clearRect(0, 0, transferWidth, transferHeight);
    transferPainted = true;
    for (const {dot, target, delay} of flights) {
      if (transfer <= delay) continue;
      const age = unit((transfer - delay) / .63);
      const fade = 1 - unit((transfer - .68 - target.row * .029) / .15);
      if (!fade) continue;
      const eased = age * age * (3 - 2 * age);
      const wave = Math.sin(age * Math.PI);
      const sx = artOffsetX + dot.sx + (dot.x - dot.sx) * settled;
      const sy = artOffsetY + dot.sy + (dot.y - dot.sy) * settled;
      const x = sx + (target.x - sx) * eased + wave * (dot.seed - .5) * transferWidth * .32;
      const y = sy + (target.y - sy) * eased + wave * dot.seed * 40;
      transferContext.globalAlpha = fade * (.42 + age * .44);
      transferContext.fillText(dot.glyph, x, y);
    }
    transferContext.globalAlpha = 1;
  }

  function draw() {
    queued = 0;
    if (!width || !dots.length) return;
    const rect = cover.getBoundingClientRect();
    const settled = progress * (2 - progress);
    const landing = typeset.getBoundingClientRect().top - rect.top - Math.min(86, innerHeight * .12);
    const transfer = reduced.matches ? 1 : unit((-rect.top - 12) / Math.max(100, landing - 12));
    drawTransfer(transfer, settled);
    if (rect.bottom <= 0 || rect.top > innerHeight || !rect.height) {
      lens.amount = 0;
      return;
    }
    const scrollExit = reduced.matches ? 0 : Math.max(0, Math.min(1, -rect.top / (rect.height * .68)));
    const exit = Math.max(scrollExit, returnProgress);
    const follow = updateLens(exit);
    const radius = Math.max(42, Math.min(112, width * .117)) * .4;
    const radiusSquared = radius * radius;
    context.clearRect(0, 0, width, height);
    const intactPortfolio = portfolioBounds && settled === 1 && exit === 0 &&
      (reduced.matches || transfer === 0);
    const magnifiedTiles = new Set();
    if (intactPortfolio) {
      context.drawImage(portfolio, ...portfolioBounds);
      if (lens.amount > .015) {
        for (const dot of dots) {
          if (!dot.tile || (dot.x - lens.x) ** 2 + (dot.y - lens.y) ** 2 >= radiusSquared) continue;
          const [, , , , tileWidth, tileHeight] = dot.tile;
          context.clearRect(dot.x - tileWidth / 2, dot.y - tileHeight / 2, tileWidth, tileHeight);
          magnifiedTiles.add(dot);
        }
      }
    }
    for (const dot of dots) {
      if (intactPortfolio && dot.tile && !magnifiedTiles.has(dot)) continue;
      if (!reduced.matches && dot.departure !== undefined && transfer > dot.departure) continue;
      // At rest the dots make a legible wordmark. On exit, the grid breaks into short streams.
      const opacity = (dot.seed < .06 ? .8 + (dot.tile ? .2 * settled : 0) :
        Math.max(0, (settled - dot.seed * .58) / .42)) * (1 - exit);
      if (opacity < .04) continue;
      context.globalAlpha = Math.min(1, opacity);
      const x = dot.sx + (dot.x - dot.sx) * settled + (dot.seed - .5) * width * exit * .28;
      const scatterY = (dot.seed - .24) * scrollExit * .6 - (dot.seed + .22) * returnProgress * .46;
      const y = dot.sy + (dot.y - dot.sy) * settled + height * scatterY;
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
        paintDot(dot, 0, 0);
        context.restore();
      } else paintDot(dot, x, y);
    }
    context.globalAlpha = 1;
    if (follow) queueDraw();
  }

  function updateLens(exit) {
    const active = hover.inside && !pointer && !reduced.matches && progress >= .97 && !returning && exit < .35;
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
    if (returning || progress >= 1) return;
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

  function disperse(duration) {
    const rect = art.getBoundingClientRect();
    if (!dots.length || rect.bottom <= 0 || rect.top >= innerHeight) return false;
    cancelAnimationFrame(animation);
    returning = true;
    const start = performance.now();
    function tick(now) {
      const elapsed = Math.max(0, Math.min(1, (now - start) / duration));
      returnProgress = elapsed * (2 - elapsed);
      queueDraw();
      if (elapsed < 1) animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
    return true;
  }

  function reassemble() {
    cancelAnimationFrame(animation);
    returning = false;
    returnProgress = 0;
    progress = reduced.matches ? 1 : 0;
    queueDraw();
    if (!reduced.matches) finish(820);
  }

  const layout = new ResizeObserver(resample);
  portfolio.addEventListener('load', resample, {once: true});
  portfolio.src = 'assets/catalog-portfolio-wordmark.webp';
  layout.observe(art);
  layout.observe(typeset);
  document.fonts?.ready.then(resample);
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
  cover.querySelector('.catalog-down').addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    directoryScroll?.abort();
    const index = document.getElementById('catalog-index');
    const route = '#' + index.id;
    if (location.hash === '#resume') location.hash = route;
    else if (location.hash !== route) history.pushState(history.state, '', route);

    requestAnimationFrame(() => {
      const from = scrollY;
      const to = from + index.getBoundingClientRect().top - 16;
      if (reduced.matches) {
        window.scrollTo({top: to, behavior: 'instant'});
        return;
      }
      const start = performance.now();
      const input = new AbortController();
      directoryScroll = input;
      for (const name of ['wheel', 'touchstart', 'keydown']) {
        window.addEventListener(name, () => input.abort(), {passive: true, signal: input.signal});
      }
      function step(now) {
        if (input.signal.aborted || location.hash !== route) {
          input.abort();
          return;
        }
        const time = unit((now - start) / 650);
        const eased = time * time * (3 - 2 * time);
        window.scrollTo({top: from + (to - from) * eased, behavior: 'instant'});
        if (time < 1) requestAnimationFrame(step);
        else input.abort();
      }
      requestAnimationFrame(step);
    });
  });
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
    if (event.button !== 0 || !event.isPrimary || returning || progress >= 1) return;
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
      returning = false;
      returnProgress = 0;
      progress = 1;
    }
    compose.hidden = reduced.matches;
    queueDraw();
  });

  return {disperse, reassemble};
};
