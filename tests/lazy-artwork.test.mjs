import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const script=await readFile(new URL('../dist/portfolio-performance.js',import.meta.url),'utf8');
function fixture(supported=true){
 const makeImage=src=>({nodeType:1,attrs:new Map([['data-performance-href',src]]),matches(){return this.attrs.has('data-performance-href');},getAttribute(name){return this.attrs.get(name)||null;},setAttribute(name,value){this.attrs.set(name,value);},setAttributeNS(ns,name,value){this.attrs.set('xlink:'+name,value);},removeAttribute(name){this.attrs.delete(name);}});
 const first=makeImage('original-cover.webp'),later=makeImage('original-detail.webp'),images=[first,later];let callback;
 class Observer{constructor(fn){callback=fn;}observe(){}unobserve(){}}
 const handlers={},window={addEventListener(name,fn){handlers[name]=fn;}};if(supported)window.IntersectionObserver=Observer;
 const document={body:{},querySelectorAll(){return images.filter(i=>i.matches());},querySelector(){return images.find(i=>i.matches())||null;}};
 const context={window,document,IntersectionObserver:Observer,MutationObserver:class{observe(){}}};vm.runInNewContext(script,context);
 return {first,later,makeImage,window,handlers,intersect:image=>callback([{target:image,isIntersecting:true}])};
}
test('only approaching original artwork loads; the source URL is preserved exactly',()=>{
 const f=fixture();assert.equal(f.first.getAttribute('href'),null);assert.equal(f.later.getAttribute('href'),null);
 f.intersect(f.first);assert.equal(f.first.getAttribute('href'),'original-cover.webp');assert.equal(f.first.getAttribute('xlink:href'),'original-cover.webp');assert.equal(f.later.getAttribute('href'),null);
});
test('a selected detail clone and print restore their original images independently of scroll',()=>{
 const f=fixture(),clone=f.makeImage('original-zoom.webp');f.window.portfolioPerformance.hydrate({querySelectorAll:()=>[clone]});assert.equal(clone.getAttribute('href'),'original-zoom.webp');assert.equal(f.later.getAttribute('href'),null);
 f.handlers.beforeprint();assert.equal(f.later.getAttribute('href'),'original-detail.webp');
});
test('browsers without intersection observation still display every original image',()=>{
 const f=fixture(false);assert.equal(f.first.getAttribute('href'),'original-cover.webp');assert.equal(f.later.getAttribute('href'),'original-detail.webp');
});
