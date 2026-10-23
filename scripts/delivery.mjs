import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function filesIn(root){const result=[];for(const entry of await readdir(root,{withFileTypes:true})){const path=resolve(root,entry.name);if(entry.isDirectory())result.push(...await filesIn(path));else result.push(path);}return result;}
export async function prepareDelivery(output,{source=resolve('dist'),planPath=resolve('content/published-images.json')}={}){
 const files=await filesIn(output),versions=new Map();let protectedImages=0,versionedReferences=0,compressedBytes=0,textBytes=0,compressedFiles=0;
 // Freeze already-published artwork. A failed mirror must never silently lower quality.
 const plan=JSON.parse(await readFile(planPath,'utf8')),available=new Set(files);

 for(const [name,entry]of Object.entries(plan.images||{})){
  if(!available.has(resolve(output,name)))continue; // Archived source backups are intentionally excluded.
  let original;try{original=await readFile(resolve(source,name));}catch(error){if(error.code==='ENOENT')continue;throw error;}
  if(digest(original)!==entry.sourceSha256)continue;
  const published=await readFile(resolve(output,name));
  if(digest(published)!==entry.publishedSha256)throw Error('作品图片与已发布原件不一致，停止发布：'+name);
  protectedImages++;
 }
 async function version(raw,file){
  if(!raw||/^(?:[a-z]+:|\/\/|#)/i.test(raw))return raw;
  const url=new URL(raw,'https://portfolio.invalid/'+relative(output,file));
  if(!/\.(?:css|js)$/.test(url.pathname)||url.pathname.includes('/_next/'))return raw;
  const target=resolve(output,'.'+decodeURIComponent(url.pathname));
  if(!target.startsWith(resolve(output)+'/'))return raw;
  let hash=versions.get(target);
  if(!hash){hash=digest(await readFile(target)).slice(0,16);versions.set(target,hash);}
  const at=raw.search(/[?#]/),path=at<0?raw:raw.slice(0,at);url.searchParams.set('v',hash);versionedReferences++;
  return path+url.search+url.hash;
 }
 for(const file of files.filter(path=>path.endsWith('.html'))){
  const html=await readFile(file,'utf8');let result='',end=0;
  // Match whole script blocks so strings in inline JavaScript never become HTML attributes.
  for(const match of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>|<link\b[^>]*>/gi)){
   result+=html.slice(end,match.index);const tag=match[0],head=tag.slice(0,tag.indexOf('>')+1);let updated=head,attrEnd=0,newHead='';
   for(const attr of head.matchAll(/\b(src|href)\s*=\s*(["'])([^"']+)\2/gi)){
    newHead+=head.slice(attrEnd,attr.index);const next=await version(attr[3].replaceAll('&amp;','&'),file);newHead+=attr[1]+'='+attr[2]+next.replaceAll('&','&amp;')+attr[2];attrEnd=attr.index+attr[0].length;
   }
   if(attrEnd)updated=newHead+head.slice(attrEnd);
   result+=updated+tag.slice(head.length);end=match.index+tag.length;
  }
  result+=html.slice(end);if(result!==html)await writeFile(file,result);
 }
 // Lossless text sidecars only. Never encode, resize or rewrite an image or a movie.
 for(const file of files.filter(path=>/\.(?:html|css|js|json)$/.test(path))){
  const bytes=await readFile(file);if(bytes.length<1024)continue;
  const compressed=gzipSync(bytes,{level:6});if(compressed.length>=bytes.length)continue;
  await writeFile(file+'.gz',compressed);compressedFiles++;textBytes+=bytes.length;compressedBytes+=compressed.length;
 }
 const report={schema:1,protectedImages,versionedReferences,compressedFiles,textBytes,compressedBytes,mediaReencoded:false};
 await writeFile(resolve(output,'delivery-report.json'),JSON.stringify(report,null,2)+'\n');return report;
}
