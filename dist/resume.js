/* Native dialog keeps the authored resume readable without changing its layout. */
(() => {
 const pages=[...document.querySelectorAll('.resume-page img')];
 const dialog=document.querySelector('#resume-dialog');
 if(!dialog||!pages.length)return;
 const image=dialog.querySelector('img'),count=dialog.querySelector('[data-resume-count]'),zoom=dialog.querySelector('[data-resume-zoom]'),previous=dialog.querySelector('[data-resume-previous]'),next=dialog.querySelector('[data-resume-next]'),body=dialog.querySelector('.resume-dialog-body');
 let page=0;
 const show=i=>{page=Math.max(0,Math.min(pages.length-1,i));image.src=pages[page].src;image.alt=pages[page].alt;dialog.querySelector('.resume-works-link').hidden=page!==0;count.textContent=`简历高清预览 · ${page+1} / ${pages.length}`;previous.disabled=page===0;next.disabled=page===pages.length-1;body.scrollTo(0,0)};
 const setZoom=value=>{dialog.classList.toggle('is-zoomed',value);zoom.setAttribute('aria-pressed',String(value));zoom.textContent=value?'适合屏幕':'放大阅读'};
 document.querySelectorAll('[data-resume-open]').forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.resumeOpen));setZoom(matchMedia('(max-width:800px)').matches);dialog.showModal()}));
 dialog.querySelector('.resume-works-link').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-resume-close]').addEventListener('click',()=>dialog.close());
 previous.addEventListener('click',()=>show(page-1));next.addEventListener('click',()=>show(page+1));zoom.addEventListener('click',()=>setZoom(!dialog.classList.contains('is-zoomed')));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){show(page+1);event.preventDefault()}if(event.key==='ArrowLeft'){show(page-1);event.preventDefault()}});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
})();
