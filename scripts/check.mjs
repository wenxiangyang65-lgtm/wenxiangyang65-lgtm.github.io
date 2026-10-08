import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

export async function filesIn(dir) {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const path=resolve(dir,entry.name);
    if(entry.isSymbolicLink())throw Error(`部署文件不能包含软链接: ${path}`);
    if(entry.isDirectory())result.push(...await filesIn(path));else result.push(path);
  }
  return result;
}
export async function check() {
  const root=resolve('dist'),files=await filesIn(root),errors=[],projects=JSON.parse(await readFile('content/projects.json','utf8'));
  if(projects.length<1)throw Error('作品目录为空');
  const slugs=new Set(),numbers=new Set();
  async function localReference(raw,source) {
    raw=raw.replaceAll('&amp;','&');
    if(!raw||raw.startsWith('#')||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw))return;
    let path;
    try {path=decodeURIComponent(raw.split(/[?#]/)[0]);}catch {errors.push(`错误的资源地址: ${raw}`);return;}
    if(!path)return;
    const target=path.startsWith('/')?resolve(root,'.'+path):resolve(source,'..',path);
    if(!target.startsWith(root+'/')&&target!==root){errors.push(`资源越出站点目录: ${raw}`);return;}
    try {const info=await stat(target);if(info.isDirectory())await stat(resolve(target,'index.html'));}catch{errors.push(`${relative(root,source)} → ${raw}`);}
  }
  for(const p of projects) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||slugs.has(p.slug)||numbers.has(p.n))errors.push(`重复或无效项目: ${p.slug}`);
    slugs.add(p.slug);numbers.add(p.n);
    if(!Number.isInteger(p.n)||p.n<1||!p.title||!['original','sleeve'].includes(p.template))errors.push(`项目字段不完整: ${p.slug}`);
    for(const value of [p.title,p.label,p.category])if(value&&/[<>]/.test(value))errors.push(`项目文字不能包含 HTML: ${p.slug}`);
    if(p.entry!==`projects/${p.slug}/index.html`)errors.push(`项目入口不在自身目录: ${p.slug}`);
    for(const key of ['entry','cover',...(p.template==='original'?['card',...(p.spin?['tab']:[])]:[])]) {
      if(!p[key]||p[key].startsWith('/')||p[key].includes('..')||!/^[-a-zA-Z0-9_./]+$/.test(p[key]||''))errors.push(`项目资源路径无效: ${p.slug}/${key}`);
      else await localReference(p[key],resolve(root,'index.html'));
    }
  }
  let size=0,js=0,html=0;
  for(const file of files) {
    size+=(await stat(file)).size;
    const rel=relative(root,file);
    if(/(?:^|\/)(?:\.env(?:\..*)?|id_rsa|id_ed25519|.*\.(?:pem|key))$/.test(rel))errors.push(`不可发布敏感配置文件: ${rel}`);
    if(/\.(?:html|css|js|json)$/.test(file)) {
      const text=await readFile(file,'utf8');
      if(/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/.test(text))errors.push(`不可发布私钥: ${rel}`);
      if(extname(file)==='.js'){try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});js++;}catch{errors.push(`JavaScript 语法错误: ${rel}`);}}
      if(extname(file)==='.json'){try{JSON.parse(text);}catch{errors.push(`JSON 格式错误: ${rel}`);}}
      if(extname(file)==='.html') {
        html++;
        // Only actual tags; inline scripts may contain template strings with unrelated URLs.
        const clean=text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,match=>match.slice(0,match.indexOf('>')+1));
        for(const tag of clean.matchAll(/<(?:img|script|link|source|video|audio|iframe|a)\b[^>]*>/gi))
          for(const attr of tag[0].matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi))await localReference(attr[1],file);
      }
      if(extname(file)==='.css')for(const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi))await localReference(match[1],file);
    }
  }
  if(errors.length)throw Error(`检查失败 (${errors.length}):\n${[...new Set(errors)].join('\n')}`);
  console.log(`检查通过：${projects.length} 个项目，${html} 个页面，${js} 个脚本，${files.length} 个文件，${(size/1048576).toFixed(1)} MB。`);
  return {files,projects,size};
}
if(process.argv[1]?.endsWith('/check.mjs')||process.argv[1]==='scripts/check.mjs')await check();
