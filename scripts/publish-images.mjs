import { readFile, writeFile, readdir, stat, mkdir, rename } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve, relative } from 'node:path';
import sharp from 'sharp';

// Encode only distribution copies. Source artwork, dimensions, animation and video stay intact.
const LIMIT = 1_000_000_000;
// Leave room for small HTML revisions without re-encoding a large source image.
const TARGET = 995_000_000;
sharp.concurrency(1);
sharp.cache({memory:64,files:0,items:0});
async function allFiles(root) {
  const found=[];
  for(const entry of await readdir(root,{withFileTypes:true})) {
    const path=resolve(root,entry.name);
    if(entry.isDirectory())found.push(...await allFiles(path));else found.push(path);
  }
  return found;
}
export async function optimisePublishedImages(output) {
  const files=await allFiles(output),sizes=await Promise.all(files.map(async p=>[p,(await stat(p)).size]));
  let total=sizes.reduce((sum,[,bytes])=>sum+bytes,0);
  const before=total,cache=resolve('.publish-image-cache');
  await mkdir(cache,{recursive:true});
  const candidates=sizes.filter(([p,n])=>p.endsWith('.webp')&&n>256*1024);
  const selected=new Map(),eligible=[];
  let publishedPlan={images:{}};
  try {publishedPlan=JSON.parse(await readFile('content/published-images.json','utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  let reused=0;
  async function reusePublished(path,bytes,metadata) {
    const name=relative(output,path),entry=publishedPlan.images[name];
    if(!entry)return false;
    const digest=data=>createHash('sha256').update(data).digest('hex');
    if(digest(await readFile(path))!==entry.sourceSha256)return false;
    if(entry.sourceSha256===entry.publishedSha256)return true;
    const cached=resolve(cache,'published-'+entry.publishedSha256+'.webp');
    let data,downloaded=false;
    try {
      try {
        data=await readFile(cached);
        if(data.length!==entry.publishedBytes||digest(data)!==entry.publishedSha256)throw Error('Invalid cached image');
      }catch {
        const response=await fetch(new URL(name,publishedPlan.origin),{signal:AbortSignal.timeout(90000)});
        if(!response.ok)return false;
        data=Buffer.from(await response.arrayBuffer());
        downloaded=true;
      }
      if(data.length!==entry.publishedBytes||digest(data)!==entry.publishedSha256)return false;
      const check=await sharp(data).metadata();
      if(check.width!==metadata.width||check.height!==metadata.height||Boolean(check.hasAlpha)!==Boolean(metadata.hasAlpha)||(check.pages||1)!==1)return false;
      if(downloaded) {
        const temporary=cached+'.'+randomUUID()+'.tmp';
        await writeFile(temporary,data);
        await rename(temporary,cached);
      }
      await writeFile(path,data);
      total+=data.length-bytes;
      selected.set(path,{path:name,before:bytes,after:data.length,quality:entry.quality,width:metadata.width,height:metadata.height});
      reused++;
      return true;
    }catch {return false;}
  }
  async function encode(path,quality,metadata) {
    const source=resolve('dist',relative(output,path)),input=await readFile(source);
    const key=createHash('sha256').update(input).update(`webp-${quality}-effort6-sharp0344`).digest('hex');
    const target=resolve(cache,key+'.webp');let data;
    try {data=await readFile(target);}catch {data=await sharp(input).withMetadata().webp({quality,alphaQuality:100,effort:6,smartSubsample:true}).toBuffer();await writeFile(target,data);}
    const check=await sharp(data).metadata();
    if(check.width!==metadata.width||check.height!==metadata.height||Boolean(check.hasAlpha)!==Boolean(metadata.hasAlpha)||(check.pages||1)!==1)throw Error(`发布图片尺寸或透明度变化: ${relative(output,path)}`);
    return data;
  }
  let cursor=0,done=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(cursor<candidates.length) {
      const [path,bytes]=candidates[cursor++],metadata=await sharp(path).metadata();
      if((metadata.pages||1)>1)continue;
      const candidate={path,bytes,metadata};eligible.push(candidate);
      if(await reusePublished(path,bytes,metadata)) {
        if(++done%50===0)console.log(`发布图片检查 ${done}/${candidates.length}`);
        continue;
      }
      const data=await encode(path,90,metadata);
      if(data.length<bytes*.85) {await writeFile(path,data);total+=data.length-bytes;selected.set(path,{path:relative(output,path),before:bytes,after:data.length,quality:90,width:metadata.width,height:metadata.height});}
      if(++done%50===0)console.log(`发布图片检查 ${done}/${candidates.length}`);
    }
  }));
  for(const quality of [86,82,78]) {
    if(total<=TARGET)break;
    // Use the original source again, avoiding successive lossy re-encoding.
    for(const item of eligible.sort((a,b)=>b.bytes-a.bytes)) {
      const previous=selected.get(item.path)?.after||item.bytes,data=await encode(item.path,quality,item.metadata);
      if(data.length<previous*.95) {await writeFile(item.path,data);total+=data.length-previous;selected.set(item.path,{path:relative(output,item.path),before:item.bytes,after:data.length,quality,width:item.metadata.width,height:item.metadata.height});}
      if(total<=TARGET)break;
    }
    console.log(`发布体积复核（静态图质量 ${quality}）：${(total/1e6).toFixed(1)} MB`);
  }
  const report={sourceBytes:before,publishedBytes:total,savedBytes:before-total,sourceFilesUnchanged:true,videoFilesUnchanged:true,animatedImagesUnchanged:true,images:[...selected.values()]};
  await writeFile(resolve(output,'image-optimisation.json'),JSON.stringify(report,null,2)+'\n');
  if(total>LIMIT-2_000_000)throw Error(`发布包仍超过 GitHub Pages 体积上限: ${(total/1048576).toFixed(1)} MB`);
  console.log(`发布包图片优化：${(before/1048576).toFixed(1)} → ${(total/1048576).toFixed(1)} MB，${selected.size} 张原尺寸静态图；原稿和视频未改动。`);
  if(reused)console.log(`复用 ${reused} 张已核验发布图片；源图和发布图均通过 SHA-256 校验。`);
  return report;
}
