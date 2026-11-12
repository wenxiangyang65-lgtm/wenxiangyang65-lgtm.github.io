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
  // The lower wordmark's outline in the 1080 × 379 reference coordinate space.
  const portfolioSilhouette = new Path2D(`
    M14,356 13,360 17,361 19,358Z
    M5,320 3,327 4,342 11,354 11,345 8,342 8,322Z
    M544,229 541,231 542,235 546,233Z
    M210,162 203,161 201,166 194,168 193,171 200,173 203,167 210,166Z
    M1039,156 1022,156 1022,158 1038,160Z
    M211,157 211,160 216,161 221,158 220,155 213,155Z
    M1042,151 1045,155 1052,153 1052,150 1049,149Z
    M716,136 718,139 714,145 714,152 721,157 720,166 693,193 688,194 683,199 669,203 666,199 666,188 670,182 671,175
    676,172 677,165 685,160 686,156 691,153 698,142 706,141 709,136Z
    M437,136 439,140 430,149 430,153 435,157 436,162 434,170 421,181 407,199 402,199 397,205 389,206 387,211 376,211
    374,209 374,194 379,190 379,185 389,169 397,161 403,159 410,148 417,148 430,135Z
    M936,124 939,127 939,134 935,136 934,141 935,146 939,149 941,159 935,163 932,172 927,176 922,186 909,193 906,198
    889,199 886,196 885,187 889,183 889,176 894,164 917,135Z
    M257,123 247,130 244,135 239,136 236,141 230,142 228,148 222,149 222,153 229,154 232,148 245,140 246,134 253,132Z
    M259,120 263,121 265,118 261,117Z
    M551,144 543,140 523,149 508,149 505,146 510,141 511,135 520,128 521,122 529,113 527,110 521,110 514,115 495,117
    482,124 481,126 485,127 491,123 499,123 500,128 496,130 494,135 487,137 484,142 479,143 463,155 452,155 450,153
    450,148 453,144 449,137 444,134 443,130 427,130 421,135 406,137 403,142 397,143 388,154 382,155 381,159 375,163
    366,175 359,197 359,209 366,217 389,217 405,205 413,204 419,197 419,194 433,183 450,161 461,161 466,154 475,154
    481,148 486,148 487,152 477,162 475,171 456,200 456,206 459,205 475,190 475,186 480,180 495,171 495,168 502,160
    508,162 515,161 533,154 542,148 548,148Z
    M648,107 639,120 633,124 632,129 627,132 618,153 604,167 589,167 586,169 586,172 590,173 592,178 584,186 576,187
    574,192 566,194 563,199 554,199 549,203 546,201 545,196 550,191 556,175 585,140 588,133 595,127 603,110 630,110
    637,104 645,104Z
    M281,98 277,99 273,106 274,108 281,102Z
    M874,94 863,99 857,106 861,114 867,118 872,118 885,109 881,99Z
    M733,50 731,59 726,62 721,72 715,74 715,77 708,86 697,92 695,97 686,104 681,104 669,116 661,115 661,112
    670,103 671,98 707,60 719,53 721,47Z
    M872,42 874,49 870,59 865,62 859,72 848,81 842,90 836,93 828,104 823,104 813,117 800,124 796,129 791,130
    780,142 777,142 775,138 780,135 786,124 795,115 795,110 800,107 807,95 825,77 830,67 836,65 838,59 861,47
    865,41Z
    M1015,162 981,161 969,155 958,155 955,153 955,132 950,124 940,117 922,118 917,123 909,124 899,135 891,137 890,141
    881,150 881,153 871,163 871,171 865,176 864,181 856,186 852,186 848,193 844,193 840,197 829,198 827,195 831,191
    832,181 845,164 847,156 866,132 864,129 851,129 844,132 827,160 822,162 813,173 808,174 804,181 794,186 789,192
    782,193 778,199 763,204 759,198 760,174 764,171 765,163 770,159 773,151 799,135 803,129 815,122 818,117 824,115
    845,97 874,65 874,61 879,58 883,50 883,43 876,35 865,35 860,41 849,42 845,48 841,48 835,54 832,54
    828,60 814,67 791,88 787,96 778,105 770,122 761,131 760,140 749,154 742,156 734,155 731,152 731,137 727,134
    726,130 701,130 680,143 671,154 664,155 660,161 645,161 639,167 625,166 624,164 631,158 635,147 645,137 649,129
    655,128 659,122 671,121 672,116 679,114 685,109 687,104 694,103 698,98 703,97 713,85 719,84 725,77 725,74
    730,72 731,68 736,65 741,51 739,44 733,41 718,43 712,48 706,48 705,52 702,55 697,55 694,60 688,61
    655,98 639,98 634,103 617,104 614,101 630,80 634,69 631,68 629,71 620,73 615,79 611,80 610,84 606,86
    605,90 588,109 556,110 553,112 556,119 561,116 579,116 582,121 575,125 570,135 560,144 557,152 547,163 533,187
    530,201 537,211 553,211 557,205 564,204 567,198 574,198 588,187 591,190 588,194 587,202 572,219 566,235 561,239
    559,247 553,250 551,259 541,270 538,278 528,287 519,289 516,286 518,271 538,238 527,244 523,253 514,263 512,274
    508,276 508,291 516,297 523,297 528,293 535,292 537,287 543,285 555,273 556,268 565,260 566,256 575,248 576,242
    580,238 580,232 585,229 586,225 590,223 591,219 600,210 601,200 611,190 611,186 618,176 622,173 637,172 644,167
    655,166 659,168 653,182 652,192 656,203 664,211 674,211 687,204 693,198 698,197 705,191 707,186 714,183 724,170
    725,163 728,160 737,161 742,159 746,162 747,166 742,175 741,194 745,203 752,211 768,211 772,205 777,205 799,192
    800,186 816,175 819,177 816,182 814,202 822,211 829,209 833,205 840,204 842,197 849,196 857,190 859,185 864,185
    866,182 869,184 871,195 877,204 882,205 888,211 897,211 906,205 912,204 915,199 921,197 934,185 944,169 946,160
    967,160 971,166 1012,165Z
    M249,36 230,36 225,41 213,42 210,47 199,48 196,53 188,55 185,60 174,61 164,73 156,73 151,79 144,80
    138,90 130,92 120,104 114,105 113,109 103,118 102,122 88,138 82,160 79,162 79,177 88,190 97,198 111,199
    115,205 125,205 130,203 134,197 141,199 149,198 155,192 166,192 169,186 180,184 182,179 190,179 191,174 186,173
    181,175 180,180 167,181 160,187 151,186 145,193 111,193 97,178 97,158 102,149 103,141 112,134 112,131 127,112
    135,110 137,104 143,98 155,91 159,85 164,84 171,78 173,73 181,72 184,66 190,66 197,60 205,59 208,54
    219,53 223,47 228,46 232,41 249,41Z
    M444,38 444,63 440,70 440,77 435,81 434,89 429,92 421,103 415,105 411,111 407,111 404,116 397,117 392,123
    386,123 382,129 367,130 361,136 344,136 340,142 325,142 323,140 323,137 333,127 333,123 343,114 343,110 352,102
    357,93 363,90 363,84 366,79 378,72 390,54 396,52 406,41 412,39 426,28 435,28Z
    M455,20 448,17 435,16 425,10 410,9 408,4 344,3 336,10 309,10 307,12 308,18 313,16 340,15 345,9
    407,9 410,16 422,16 424,19 421,23 415,24 413,29 405,30 402,35 391,36 384,47 377,48 366,60 361,61
    335,95 328,100 319,115 313,119 304,135 299,137 294,147 273,150 273,153 282,155 284,160 268,185 235,225 232,234
    222,244 217,253 212,257 212,260 205,263 195,279 163,311 158,313 151,324 145,325 141,331 135,332 132,337 126,338
    123,343 114,344 111,350 105,350 101,356 94,356 87,363 77,364 69,362 62,369 54,370 38,369 35,363 22,363
    21,366 23,368 34,368 37,374 48,372 64,374 68,369 76,367 89,368 96,362 106,361 123,350 131,348 134,343
    140,343 145,337 150,337 154,331 177,317 179,312 186,311 188,306 205,293 218,276 224,273 237,260 238,256 257,235
    258,230 277,210 283,198 292,191 292,188 297,184 298,174 302,172 314,155 327,154 335,148 347,148 354,142 366,142
    375,135 387,135 394,129 403,129 412,122 418,122 421,116 427,116 436,104 448,96 453,88 454,80 459,75 459,67
    464,58 463,49 459,46 459,37 449,27 449,23Z
  `);

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

  function drawTitle(text, family, weight, baseline, size, share, silhouette) {
    ink.font = `${weight} ${size}px ${family}`;
    const metrics = ink.measureText(text);
    const left = width * (1 - share) / 2;
    if (silhouette) {
      const top = height * baseline - metrics.actualBoundingBoxAscent;
      const span = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      ink.save();
      ink.translate(left, top);
      ink.scale(width * share / 1080, span / 379);
      ink.fill(silhouette, 'evenodd');
      ink.restore();
      return;
    }
    const span = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const scale = width * share / (span || metrics.width);
    ink.save();
    ink.translate(left, height * baseline);
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
    drawTitle('Portfolio', '"Snell Roundhand", "Segoe Script", cursive', 600, .79, height * .63, .94, portfolioSilhouette);
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
    for (const dot of dots) {
      if (!reduced.matches && dot.departure !== undefined && transfer > dot.departure) continue;
      // At rest the dots make a legible wordmark. On exit, the grid breaks into short streams.
      const opacity = (dot.seed < .06 ? .8 : Math.max(0, (settled - dot.seed * .58) / .42)) * (1 - exit);
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
        context.fillText(dot.glyph, 0, 0);
        context.restore();
      } else context.fillText(dot.glyph, x, y);
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
