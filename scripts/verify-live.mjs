import { readFile } from 'node:fs/promises';
const base=process.env.TENCENT_SITE_URL;
if(!/^https?:\/\//.test(base||''))throw Error('Missing public site URL');
const manifest=JSON.parse(await readFile('build/deploy-manifest.json','utf8'));
async function request(path,options={}) {
  const response=await fetch(new URL(path,base.endsWith('/')?base:base+'/'),{...options,signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache',...options.headers}});
  if(!response.ok)throw Error(`${path}: HTTP ${response.status}`);
  return response;
}
const release=await (await request('_release.json?probe='+Date.now())).json();
if(release.commit!==process.env.GITHUB_SHA||release.release_id!==process.env.PORTFOLIO_EXPECTED_RELEASE||!release.verified)throw Error('Public release differs from deployed build');
await request('');
for(const path of manifest.projects)await request(path);
const media=['assets/cover.webp','assets/resume.webp','assets/cover-motion.mp4'];
for(const path of media) {
  const r=await request(path,{method:'HEAD'});
  if(Number(r.headers.get('content-length'))!==manifest.files[path].bytes)throw Error(`Resource size mismatch: ${path}`);
}
const video=await request('assets/cover-motion.mp4',{headers:{Range:'bytes=0-1023'}});
if(video.status!==206)throw Error('Video seek/range requests are unavailable');
await video.arrayBuffer();
console.log(`公网验证通过：${manifest.projects.length} 个项目、封面与简历图片、视频和视频拖动。${base}`);
