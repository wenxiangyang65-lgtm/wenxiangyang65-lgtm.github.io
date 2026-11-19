import {cp,readFile,writeFile,rm,stat} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {filesIn} from './check.mjs';

// Pages keeps every page and image. Large original films are read from this
// Tencent HTTPS origin, instead of duplicating the bytes across both hosts.
export const sharedMediaPaths=[
  'projects/a-horse/assets/video/',
  'projects/xujie/assets/videos/',
  'projects/churuixue/assets/full-film-hd.mp4',
  'projects/mr-chen/assets/film.mp4',
  'projects/spring-horse/assets/film-final-1080.mp4',
  'projects/xinxuan-redesign/media/xinxuan-new-year-film.mp4'
];

export function rewriteMediaReferences(text,name,mediaPaths,origin) {
  const forms=new Map();
  for(const path of mediaPaths) {
    const local=relative(dirname(name),path).replaceAll('\\','/')+(path.endsWith('/')?'/':'');
    for(const form of [path,'/'+path,local,...(!local.startsWith('.')?['./'+local]:[])])forms.set(form,origin+path);
  }
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('(^|[\\s\\x22\\x27\\x60=(])('+[...forms.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')+')','gm');
  return text.replace(pattern,(_,before,path)=>before+forms.get(path));
}

export async function preparePagesMirror(input,output,{commit,mediaPaths=sharedMediaPaths,limit=1_000_000_000}={}) {
  if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('GitHub mirror requires an exact commit');
  const origin='https://yangwenxiang.com/';
  const release=commit.slice(0,16);
  const versioned=text=>text.replace(/https:\/\/yangwenxiang\.com\/[^\s\x22\x27\x60<>]*?\.mp4([?#])?/g,(url,separator)=>{const base=separator?url.slice(0,-1):url;return base+'?release='+release+(separator==='?'?'&':separator==='#'?'#':'');});
  const excluded=path=>mediaPaths.some(prefix=>prefix.endsWith('/')?path.startsWith(prefix):path===prefix);
  const external={};
  for(const file of await filesIn(input)) {
    const name=relative(input,file);
    if(!excluded(name))continue;
    const bytes=await readFile(file);
    external[name]={url:origin+name+'?release='+release,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }
  await rm(output,{recursive:true,force:true});
  await cp(input,output,{recursive:true,filter:path=>{
    const name=relative(input,path);
    return !name.endsWith('.gz')&&!excluded(name)&&name!=='deploy-manifest.json';
  }});
  const textFiles=(await filesIn(output)).filter(p=>/\.(?:html|css|js|json|svg)$/.test(p));
  let references=0;
  // Recompute code hashes after rewriting scripts, so the mirror never retains
  // a cache key from the Tencent variant of the same file.
  for(const file of textFiles) {
    const text=await readFile(file,'utf8');
    const next=versioned(rewriteMediaReferences(text,relative(output,file),mediaPaths,origin));
    if(next!==text){await writeFile(file,next);references++;}
  }
  for(const file of textFiles.filter(p=>p.endsWith('.html'))) {
    let html=await readFile(file,'utf8');
    const matches=[...html.matchAll(/\b(src|href)=(['"])([^'"\s]+\.(?:js|css))\?v=([a-f0-9]{16})\2/g)];
    for(const m of matches) {
      if(/^(?:https?:|\/\/)/.test(m[3]))continue;
      const url=new URL(m[3],'https://portfolio.invalid/'+relative(output,file));
      const target=resolve(output,'.'+url.pathname);
      const hash=createHash('sha256').update(await readFile(target)).digest('hex').slice(0,16);
      html=html.replace(m[0],`${m[1]}=${m[2]}${m[3]}?v=${hash}${m[2]}`);
    }
    await writeFile(file,html);
  }
  await writeFile(resolve(output,'pages-media.json'),JSON.stringify({schema:1,commit,files:external},null,2)+'\n');
  for(const file of textFiles.filter(p=>/\.(?:html|css|js|json)$/.test(p))) {
    const bytes=await readFile(file);
    if(bytes.length>=1024){const gz=gzipSync(bytes,{level:6});if(gz.length<bytes.length)await writeFile(file+'.gz',gz);}
  }
  const original=JSON.parse(await readFile(resolve(input,'deploy-manifest.json'),'utf8'));
  const files={};let total=0;
  for(const file of await filesIn(output)) {
    const bytes=await readFile(file);total+=bytes.length;
    files[relative(output,file)]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  }
  const manifest=JSON.stringify({...original,files,externalMedia:external},null,2)+'\n';
  total+=Buffer.byteLength(manifest);
  if(total>=limit)throw Error(`Complete GitHub mirror exceeds capacity: ${total} bytes`);
  await writeFile(resolve(output,'deploy-manifest.json'),manifest);
  const report={commit,bytes:total,sharedVideos:Object.keys(external).length,savedBytes:Object.values(external).reduce((n,f)=>n+f.bytes,0),rewrittenFiles:references};
  console.log('完整 GitHub 镜像：'+JSON.stringify(report));return report;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const input=resolve('build');
  const {commit}=JSON.parse(await readFile(resolve(input,'deploy-manifest.json'),'utf8'));
  await preparePagesMirror(input,resolve('build-pages'),{commit});
}
