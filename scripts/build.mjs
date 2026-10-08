import { cp, rm, readFile, writeFile, chmod } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { check, filesIn } from './check.mjs';
import { compileContent } from './content.mjs';

await check();
const output=resolve('build');
await rm(output,{recursive:true,force:true});
await cp('dist',output,{recursive:true,filter:path=>!path.endsWith('.DS_Store')});
const projects=await compileContent(output);
const commit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const created=new Date().toISOString();
await writeFile(resolve(output,'deployment-health.json'),JSON.stringify({status:'ok',commit,created,projects:projects.length})+'\n');
const files={};
for(const file of await filesIn(output)) {
  const bytes=await readFile(file);
  files[relative(output,file)]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  await chmod(file,0o644);
}
await writeFile(resolve(output,'deploy-manifest.json'),JSON.stringify({schema:1,commit,created,projects:projects.map(p=>p.entry),files},null,2)+'\n');
console.log(`构建完成：build/，${Object.keys(files).length} 个文件，版本 ${commit.slice(0,12)}。`);
