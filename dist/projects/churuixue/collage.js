(() => {
 const hero=document.querySelector('.atelier-hero'), board=hero?.querySelector('.memory-wall');
 if(!board)return;
 const paths=board.querySelectorAll('.memory-threads path');
 let scheduled=0;
 const draw=()=>{
  scheduled=0;
  if(innerWidth<=760)return;
  const base=board.getBoundingClientRect();
  const point=el=>{const r=el.getBoundingClientRect();return [r.left+r.width/2-base.left,r.top+r.height/2-base.top];};
  const center=point(board.querySelector('.card-cover'));
  board.querySelector('.memory-threads').setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);
  board.querySelectorAll('.memory-stack').forEach((stack,i)=>{
   const points=[...stack.querySelectorAll('.chapter-medallion')].map(point);
   paths[i].setAttribute('d',points.map((p,j)=>`${j?'L':'M'}${p.join(',')}`).join(' ') +` M${points[0].join(',')} Q${center[0]},${points[0][1]} ${center.join(',')}`);
  });
 };
 const schedule=()=>{if(!scheduled)scheduled=requestAnimationFrame(draw)};
 new ResizeObserver(schedule).observe(board);document.fonts.ready.then(schedule);
 board.querySelectorAll('img').forEach(img=>img.addEventListener('load',schedule));
 board.addEventListener('transitionend',schedule);
 let lightFrame=0;
 hero.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||document.body.classList.contains('motion-paused')||innerWidth<900)return;
  cancelAnimationFrame(lightFrame);lightFrame=requestAnimationFrame(()=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--light-x',`${8+(e.clientX-r.left)/r.width*20}%`);hero.style.setProperty('--light-y',`${4+(e.clientY-r.top)/r.height*12}%`)});
 });
 hero.addEventListener('pointerleave',()=>{cancelAnimationFrame(lightFrame);hero.style.removeProperty('--light-x');hero.style.removeProperty('--light-y')});
 document.addEventListener('memoir:motionchange',schedule);schedule();
})();
