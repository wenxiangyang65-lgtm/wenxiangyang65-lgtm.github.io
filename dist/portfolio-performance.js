/* Delay original SVG image requests without changing artwork bytes, geometry or masks. */
(()=>{
'use strict';
const selector='image[data-performance-href]';
function hydrate(root){
 const images=root.matches?.(selector)?[root]:[...root.querySelectorAll(selector)];
 images.forEach(image=>{
  const src=image.getAttribute('data-performance-href');if(!src)return;
  image.setAttributeNS('http://www.w3.org/1999/xlink','href',src);image.setAttribute('href',src);
  image.removeAttribute('data-performance-href');observer?.unobserve(image);
 });
}
let observer=null;
if('IntersectionObserver'in window)observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)hydrate(entry.target);});},{rootMargin:'600px 0px'});
function watch(root){
 const images=root.matches?.(selector)?[root]:[...root.querySelectorAll(selector)];
 images.forEach(image=>{if(observer)observer.observe(image);else hydrate(image);});
}
window.portfolioPerformance={hydrate};
watch(document);
if(document.querySelector(selector)){
 const mutations=new MutationObserver(entries=>entries.forEach(entry=>entry.addedNodes.forEach(node=>{if(node.nodeType===1)watch(node);})));
 mutations.observe(document.body,{childList:true,subtree:true});
}
window.addEventListener('beforeprint',()=>hydrate(document));
})();
