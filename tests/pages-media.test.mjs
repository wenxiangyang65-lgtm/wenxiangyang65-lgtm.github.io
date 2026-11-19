import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {preparePagesMirror,rewriteMediaReferences} from '../scripts/build-pages.mjs';

test('shared film rewriting handles dynamic clips, root catalogs, queries and time offsets',()=>{
 const media=['projects/a-horse/assets/video/','projects/churuixue/assets/full-film-hd.mp4'];
 const origin='https://media.example/commit/dist/';
 const script="video.src=`assets/video/${clip}.mp4#t=12`; const film='assets/video/film.mp4?v=123'; const image='assets/frame.webp'; const other='https://other.example/projects/a-horse/assets/video/a.mp4';";
 const out=rewriteMediaReferences(script,'projects/a-horse/editorial.js',media,origin);
 assert.ok(out.includes('`'+origin+'projects/a-horse/assets/video/${clip}.mp4#t=12`'));
 assert.ok(out.includes("'"+origin+"projects/a-horse/assets/video/film.mp4?v=123'"));
 assert.ok(out.includes("'assets/frame.webp'"));
 assert.ok(out.includes("'https://other.example/projects/a-horse/assets/video/a.mp4'"));
 assert.equal(rewriteMediaReferences('"/projects/churuixue/assets/full-film-hd.mp4#t=40"','shared-video-sources.js',media,origin),'"'+origin+'projects/churuixue/assets/full-film-hd.mp4#t=40"');
});

test('complete mirror retains pages and image bytes, shares original video, and refreshes code hashes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'portfolio-pages-'));
 const input=join(root,'build'),output=join(root,'mirror'),commit='a'.repeat(40);
 try {
  await mkdir(join(input,'projects/demo/assets'),{recursive:true});
  await writeFile(join(input,'index.html'),'<script src="projects/demo/app.js?v=0123456789abcdef"></script>');
  await writeFile(join(input,'projects/demo/app.js'),"const film='assets/film.mp4#t=2';");
  await writeFile(join(input,'projects/demo/assets/film.mp4'),'original video bytes');
  await writeFile(join(input,'projects/demo/assets/image.webp'),'original image bytes');
  await writeFile(join(input,'deploy-manifest.json'),JSON.stringify({commit,projects:['projects/demo/index.html'],files:{}}));
  const report=await preparePagesMirror(input,output,{commit,mediaPaths:['projects/demo/assets/film.mp4']});
  assert.equal(report.sharedVideos,1);
  assert.equal(await readFile(join(output,'projects/demo/assets/image.webp'),'utf8'),'original image bytes');
  assert.equal(await readFile(join(input,'projects/demo/assets/film.mp4'),'utf8'),'original video bytes');
  await assert.rejects(readFile(join(output,'projects/demo/assets/film.mp4')),/ENOENT/);
  assert.match(await readFile(join(output,'projects/demo/app.js'),'utf8'),new RegExp('https://yangwenxiang.com/projects/demo/assets/film.mp4\\?release='+commit.slice(0,16)+'#t=2'));
  assert.ok(!(await readFile(join(output,'index.html'),'utf8')).includes('0123456789abcdef'));
  const manifest=JSON.parse(await readFile(join(output,'deploy-manifest.json'),'utf8'));
  assert.deepEqual(manifest.projects,['projects/demo/index.html']);
  assert.ok(manifest.files['projects/demo/assets/image.webp']);
  assert.ok(manifest.externalMedia['projects/demo/assets/film.mp4']);
  await assert.rejects(preparePagesMirror(input,join(root,'too-small'),{commit,mediaPaths:['projects/demo/assets/film.mp4'],limit:1}),/capacity/);
 }finally{await rm(root,{recursive:true,force:true});}
});
