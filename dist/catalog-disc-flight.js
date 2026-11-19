/* A single film-like flight between the existing glyph assembly and its return. */
window.initializeCatalogDiscFlight = function ({art, compose, reduced, onFinish}) {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const integrated = [], film = [];
  for (const project of projects) for (const item of project.catalogItems || []) {
    const group = item.group === 'integrated' ? integrated : item.group === 'film' ? film : null;
    if (group && item.image && !group.some(other => other.image === item.image)) group.push(item);
  }
  const pool = [];
  for (let i = 0; i < Math.max(integrated.length, film.length); i++) {
    if (integrated[i]) pool.push(integrated[i]);
    if (film[i]) pool.push(film[i]);
  }
  if (!pool.length) return null;

  const layer = document.createElement('div');
  layer.className = 'catalog-disc-flight';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  const space = document.createElement('div');
  space.className = 'catalog-flight-space';
  layer.append(space);
  art.append(layer);

  // The reference moves from a distant diagonal field, through tilted discs,
  // into a close stack. The last push separates that stack beyond the frame.
  const field = [
    [-.32,.23,-.4], [.33,-.26,.3], [-.12,.34,.1], [.12,.06,-.2],
    [-.36,-.19,.2], [.32,.24,-.3], [-.06,-.26,.35], [.04,.31,-.15],
    [.23,-.04,.1], [-.22,.02,-.05]
  ];
  const beats = [0,.14,.35,.53,.74,.91,1];
  const duration = 10600;
  const clamp = n => Math.max(0, Math.min(1,n));
  const ease = n => n*n*(3-2*n);
  const mix = (a,b,n) => a+(b-a)*n;
  let discs = [], timer = 0, frame = 0, token = 0, round = 0;
  let active = false, visible = false, began = 0, width = 0, height = 0, perspective = 900;

  function label(playing) {
    compose.setAttribute('aria-label', playing ? '跳过唱片动画' : '重播代码与唱片封面动画');
  }
  function measure() {
    const rect = art.getBoundingClientRect();
    width = rect.width; height = rect.height;
    perspective = Math.max(650,Math.min(1200,width*1.12));
    layer.style.setProperty('--flight-perspective',perspective+'px');
    layer.style.setProperty('--flight-disc-size',Math.min(210,Math.max(86,width*.16))+'px');
    return rect.bottom > 0 && rect.top < innerHeight && width > 0 && height > 0;
  }
  function reset() {
    active = false;
    layer.hidden = true;
    layer.dataset.phase = 'idle';
    art.classList.remove('is-disc-flight');
    art.style.removeProperty('--catalog-glyph-opacity');
    label(false);
  }
  function cancel() {
    token++;
    clearTimeout(timer); timer = 0;
    cancelAnimationFrame(frame); frame = 0;
    reset();
  }
  function complete() {
    cancel();
    onFinish?.();
  }
  function pose(i,key) {
    const [x,y,depth] = field[i], side = i%2 ? 1 : -1;
    const tilt = (i%3-1)*13, roll = (i%5-2)*7;
    const states = [
      [0,0,-2050-i*28,.62,0,0,roll+side*26],
      [x*width*.72,y*height*.72,-940+depth*100,1,tilt*.4,tilt,roll],
      [x*width*1.18,y*height*1.2,-230+depth*190,1.05,58+tilt,side*17,roll*.5],
      [x*width*1.12,y*height*1.12,70+depth*190,1,tilt*.8,side*11,roll*.7],
      [-i*3.8,i*2.2,230-i*9,1.14,0,-5,-i*.55],
      [-i*4,i*2,perspective*.69-i*9,1.17,0,-4,-i*.35],
      [side*width*(.38+i*.035),(y||.1)*height*1.8,perspective*.77-i*8,1.27,tilt,side*24,side*(14+i*4)]
    ];
    return states[key];
  }
  function paint(t) {
    let beat = 0;
    while (beat < beats.length-2 && t > beats[beat+1]) beat++;
    const amount = ease(clamp((t-beats[beat])/(beats[beat+1]-beats[beat])));
    const phase = t<.14 ? 'emerging' : t<.53 ? 'floating' : t<.91 ? 'stacking' : 'departing';
    if (layer.dataset.phase !== phase) layer.dataset.phase = phase;
    art.style.setProperty('--catalog-glyph-opacity',String(1-ease(clamp(t/.14))));
    discs.forEach((disc,i) => {
      const a=pose(i,beat), b=pose(i,beat+1), p=a.map((value,j)=>mix(value,b[j],amount));
      disc.style.transform=`translate3d(calc(-50% + ${p[0].toFixed(2)}px),calc(-50% + ${p[1].toFixed(2)}px),${p[2].toFixed(2)}px) rotateX(${p[4].toFixed(2)}deg) rotateY(${p[5].toFixed(2)}deg) rotateZ(${p[6].toFixed(2)}deg) scale(${p[3].toFixed(4)})`;
      disc.style.opacity=String(ease(clamp((t-i*.002)/.065))*(1-ease(clamp((t-.945)/.055))));
    });
  }
  function tick(now) {
    if (!active) return;
    const t=clamp((now-began)/duration);
    paint(t);
    if (t<1) frame=requestAnimationFrame(tick);
    else complete();
  }
  function prepare() {
    space.replaceChildren();
    const images=[];
    discs=Array.from({length:Math.min(field.length,pool.length)},(_,i)=>{
      const item=pool[(i+round*3)%pool.length];
      const disc=document.createElement('span');
      disc.className='catalog-flight-disc';
      disc.dataset.project=item.id;
      const rim=document.createElement('span');rim.className='gallery-disc-rim';
      const face=document.createElement('span');face.className='gallery-disc-art';
      const img=document.createElement('img');img.alt='';img.decoding='async';
      img.src=item.image;
      face.append(img);disc.append(rim,face);space.append(disc);images.push(img);
      return disc;
    });
    round++;
    return images;
  }
  async function start() {
    if (active || reduced.matches || document.hidden || !measure()) return false;
    clearTimeout(timer); timer=0;
    const current=++token;
    const images=prepare();
    // Give the real portfolio covers time to decode; never block on a bad image.
    let decodeTimer;
    await Promise.race([
      Promise.allSettled(images.map(img=>img.decode?.())),
      new Promise(resolve=>{decodeTimer=setTimeout(resolve,1600);})
    ]);
    clearTimeout(decodeTimer);
    if (current!==token || reduced.matches || document.hidden || !measure()) return false;
    active=true;began=performance.now();
    layer.hidden=false;art.classList.add('is-disc-flight');label(true);
    paint(0);frame=requestAnimationFrame(tick);
    return true;
  }
  function schedule(delay=600) {
    clearTimeout(timer);
    if (!reduced.matches && !active) timer=setTimeout(start,delay);
  }
  if (typeof IntersectionObserver==='function') new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if (!visible) cancel();
  },{threshold:.12}).observe(art);
  new ResizeObserver(()=>{if(active) measure();}).observe(art);
  document.addEventListener('visibilitychange',()=>{if(document.hidden) cancel();});
  window.addEventListener('pagehide',cancel);
  reduced.addEventListener('change',()=>{if(reduced.matches) cancel();});
  label(false);
  return {schedule,start,cancel,skip:complete,get active(){return active;}};
};
