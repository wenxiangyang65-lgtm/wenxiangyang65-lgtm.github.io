(() => {
  const progress=document.querySelector('.reading-progress');
  const links=[...document.querySelectorAll('.site-header nav a')];
  const sections=links.map(link=>document.querySelector(link.hash)).filter(Boolean);
  let scheduled=false;
  function update(){
    scheduled=false;
    const maximum=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${maximum>0?Math.min(1,Math.max(0,scrollY/maximum)):0})`;
    let active=sections[0];
    sections.forEach(section=>{if(section.getBoundingClientRect().top<=150)active=section;});
    links.forEach(link=>{if(link.hash===`#${active.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);
  addEventListener('load',queue);update();
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.05,rootMargin:'0px 0px 80px 0px'});
    document.querySelectorAll('.principles article,.act-header,.detail-grid,.summary-copy').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
  }
})();
