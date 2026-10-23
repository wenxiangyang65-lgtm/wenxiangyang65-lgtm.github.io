import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {prepareDelivery} from '../scripts/delivery.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
async function fixture(fn){const root=await mkdtemp(join(tmpdir(),'portfolio-delivery-'));try{const source=join(root,'dist'),output=join(root,'build'),planPath=join(root,'plan.json');await mkdir(source);await mkdir(output);await writeFile(planPath,'{"images":{}}');await fn({source,output,planPath});}finally{await rm(root,{recursive:true,force:true});}}
test('code versions follow content and text gzip decodes exactly; artwork bytes stay intact',()=>fixture(async({source,output,planPath})=>{
 const code='window.example=true;\n'.repeat(90),media=Buffer.from([0,0,1,45,255,42]);
 await mkdir(join(output,'nested'));await writeFile(join(output,'main.js'),code);await writeFile(join(output,'clip.mp4'),media);
 await writeFile(join(output,'nested/index.html'),'<script src="../main.js?v=old"></script><script>const sample="<link href=\'../missing.css\'>";</script><video src="../clip.mp4"></video>');
 const report=await prepareDelivery(output,{source,planPath}),html=await readFile(join(output,'nested/index.html'),'utf8');
 assert.ok(html.includes('../main.js?v='+hash(code).slice(0,16)));assert.ok(html.includes("<link href='../missing.css'>"));
 assert.deepEqual(gunzipSync(await readFile(join(output,'main.js.gz'))),Buffer.from(code));assert.deepEqual(await readFile(join(output,'clip.mp4')),media);assert.equal(report.mediaReencoded,false);
}));
test('rejects accidental recompression of previously published artwork',()=>fixture(async({source,output,planPath})=>{
 await writeFile(join(source,'art.webp'),'original');await writeFile(join(output,'art.webp'),'lower-quality');await writeFile(planPath,JSON.stringify({images:{'art.webp':{sourceSha256:hash('original'),publishedSha256:hash('published-original')}}}));
 await assert.rejects(prepareDelivery(output,{source,planPath}),/停止发布/);
}));
