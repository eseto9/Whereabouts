// node tools/build.mjs
//   → dist/whereabouts.html  the single file to publish as the Claude artifact
//   → docs/index.html        the same page for GitHub Pages (single-player there: no room or db)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, page } from './assemble.mjs';

const html = page();
for (const rel of ['dist/whereabouts.html', 'docs/index.html']) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`built ${rel} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
}
// plain files only: tell GitHub Pages not to run them through Jekyll
fs.writeFileSync(path.join(ROOT, 'docs', '.nojekyll'), '');
