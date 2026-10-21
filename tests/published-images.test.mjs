import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {optimisePublishedImages} from '../scripts/publish-images.mjs';

const digest=data=>createHash('sha256').update(data).digest('hex');
async function fixture(run){
 const directory=await mkdtemp(join(tmpdir(),'portfolio-mirrors-'));
 const previous=process.cwd(),fetch=globalThis.fetch,actions=process.env.GITHUB_ACTIONS;
 try{
  const pixels=Buffer.alloc(1024*1024*3);let seed=17;
  for(let i=0;i<pixels.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;pixels[i]=seed>>>24;}
  const input=await sharp(pixels,{raw:{width:1024,height:1024,channels:3}}).webp({quality:95}).toBuffer();
  const published=await sharp(input).webp({quality:86}).toBuffer();
  await Promise.all(['content','dist','build'].map(p=>mkdir(join(directory,p))));
  await Promise.all(['dist','build'].map(p=>writeFile(join(directory,p,'scene.webp'),input)));
  await writeFile(join(directory,'content/published-images.json'),JSON.stringify({origin:'https://primary.example/',images:{'scene.webp':{sourceSha256:digest(input),publishedSha256:digest(published),publishedBytes:published.length,quality:86}}}));
  process.chdir(directory);process.env.GITHUB_ACTIONS='true';
  await run({directory,published});
 }finally{
  process.chdir(previous);globalThis.fetch=fetch;
  if(actions===undefined)delete process.env.GITHUB_ACTIONS;else process.env.GITHUB_ACTIONS=actions;
  await rm(directory,{recursive:true,force:true});
 }
}

test('rejects mismatched mirror bytes and uses the verified alternate',async()=>{
 await fixture(async({directory,published})=>{
  const calls=[];
  globalThis.fetch=async url=>{calls.push(String(url));return new Response(calls.length===1?Buffer.from('incorrect cached response'):published)};
  await optimisePublishedImages(join(directory,'build'));
  assert.equal(calls.length,2);
  assert.match(calls[0],/^https:\/\/wenxiangyang65-lgtm.github.io\//);
  assert.match(calls[1],/^https:\/\/primary.example\//);
  assert.equal(digest(await readFile(join(directory,'build/scene.webp'))),digest(published));
 });
});

test('network failure on one mirror does not force source re-encoding',async()=>{
 await fixture(async({directory,published})=>{
  let calls=0;
  globalThis.fetch=async()=>{if(++calls===1)throw new Error('connection timeout');return new Response(published)};
  await optimisePublishedImages(join(directory,'build'));
  assert.equal(calls,2);
  assert.equal(digest(await readFile(join(directory,'build/scene.webp'))),digest(published));
 });
});
