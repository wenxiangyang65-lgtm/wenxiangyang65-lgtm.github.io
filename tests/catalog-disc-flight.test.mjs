import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../dist/catalog-disc-flight.js',import.meta.url),'utf8');
const projects=JSON.parse(await readFile(new URL('../content/projects.json',import.meta.url),'utf8'));
function scene({reduced=false,width=1440,offscreen=false}={}) {
 const callbacks=new Map(),documentEvents=new Map();let now=0,nextFrame=0,finished=0;
 class Element {
  children=[];dataset={};hidden=false;attributes={};
  style={values:new Map(),setProperty(k,v){this.values.set(k,v);},removeProperty(k){this.values.delete(k);}};
  classList={add(){},remove(){}};
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(k,v){this.attributes[k]=v;}
  getBoundingClientRect(){return {width,height:width*.54,top:offscreen?-2000:100,bottom:offscreen?-1000:100+width*.54};}
  decode(){return Promise.resolve();}
 }
 const art=new Element(),compose=new Element(),preference={matches:reduced,addEventListener(){}};
 const document={hidden:false,createElement(){return new Element();},addEventListener(k,fn){documentEvents.set(k,fn);}};
 const context={window:{PORTFOLIO_PROJECTS:projects,addEventListener(){}},document,innerHeight:900,
  performance:{now:()=>now},setTimeout,clearTimeout,
  requestAnimationFrame(fn){const id=++nextFrame;callbacks.set(id,fn);return id;},cancelAnimationFrame(id){callbacks.delete(id);},
  IntersectionObserver:class{observe(){}},ResizeObserver:class{observe(){}}};
 vm.runInNewContext(source,context);
 const flight=context.window.initializeCatalogDiscFlight({art,compose,reduced:preference,onFinish(){finished++;}});
 return {art,compose,document,flight,layer:art.children[0],get finished(){return finished;},step(t){now=t;const pending=[...callbacks.values()];callbacks.clear();pending.forEach(fn=>fn(now));},hide(){document.hidden=true;documentEvents.get('visibilitychange')();}};
}

test('glyph interlude uses only real integrated/AI covers and returns to the original lettering once',async()=>{
 const s=scene();await s.flight.start();
 assert.equal(s.flight.active,true);
 const discs=s.layer.children[0].children;
 const covers=new Set(projects.flatMap(p=>(p.catalogItems||[]).filter(i=>['integrated','film'].includes(i.group)).map(i=>i.image)));
 assert.equal(discs.length,10);
 for(const disc of discs)assert.ok(covers.has(disc.children[1].children[0].src));
 assert.equal(s.layer.dataset.phase,'emerging');
 s.step(3500);assert.equal(s.layer.dataset.phase,'floating');
 assert.ok(new Set(discs.map(d=>d.style.transform)).size>1);
 s.step(7900);assert.equal(s.layer.dataset.phase,'stacking');
 s.step(10599);assert.equal(s.layer.dataset.phase,'departing');
 s.step(10600);assert.equal(s.layer.hidden,true);assert.equal(s.flight.active,false);
 assert.equal(s.finished,1);assert.equal(s.art.style.values.has('--catalog-glyph-opacity'),false);
 s.step(15000);assert.equal(s.finished,1);
});

test('navigation and hidden tabs cancel the interlude without restarting the glyphs',async()=>{
 const s=scene({width:390});await s.flight.start();s.step(1000);s.hide();
 assert.equal(s.flight.active,false);assert.equal(s.layer.hidden,true);assert.equal(s.finished,0);
 s.step(11000);assert.equal(s.finished,0);
 assert.equal(await s.flight.start(),false);
});

test('reduced motion and offscreen covers never launch or load cover images',async()=>{
 for(const options of [{reduced:true},{offscreen:true}]){
  const s=scene(options);assert.equal(await s.flight.start(),false);
  assert.equal(s.layer.children[0].children.length,0);assert.equal(s.flight.active,false);
 }
});
