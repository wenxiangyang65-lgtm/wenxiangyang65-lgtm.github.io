import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function compileContent(target='dist') {
  const projects=JSON.parse(await readFile('content/projects.json','utf8'));
  const result=await Promise.all(projects.map(async project=>{
    const p={...project};
    for(const field of ['cover','card','tab']) if(p[field]) {
      const digest=createHash('sha256').update(await readFile(resolve('dist',p[field]))).digest('hex').slice(0,12);
      p[field]+=`?v=${digest}`;
    }
    return p;
  }));
  await writeFile(resolve(target,'project-data.js'),`/* Generated from content/projects.json. Run npm run content after editing. */\nwindow.PORTFOLIO_PROJECTS=${JSON.stringify(result).replaceAll('<','\\u003c')};\n`);
  return projects;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await compileContent();
