// node tools/build.mjs → dist/whereabouts.html (the single file to publish)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, page } from './assemble.mjs';

const out = path.join(ROOT, 'dist', 'whereabouts.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
const html = page();
fs.writeFileSync(out, html);
console.log(`built ${path.relative(ROOT, out)} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
