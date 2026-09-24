// node tools/build.mjs
//   → dist/whereabouts.html  the single file to publish as the Claude artifact
//   → docs/index.html        the same page for GitHub Pages, plus what a phone needs to
//                            install it to the home screen and open it full screen
//                            (icons come from tools/make-icons.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, page } from './assemble.mjs';

const html = page();
const write = (rel, text) => {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
  console.log(`built ${rel} (${(Buffer.byteLength(text) / 1024).toFixed(1)} KB)`);
};

write('dist/whereabouts.html', html);

const INSTALL = `<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">
<meta name="theme-color" content="#FFD7A8">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Whereabouts">
`;
if (!html.includes('</title>\n')) throw new Error('no </title> to put the install tags after');
write('docs/index.html', html.replace('</title>\n', () => '</title>\n' + INSTALL));
write('docs/manifest.webmanifest', JSON.stringify({
  name: 'Whereabouts',
  short_name: 'Whereabouts',
  description: 'A co-op I spy game in a tiny 3D island town.',
  start_url: './',
  scope: './',
  display: 'fullscreen',
  orientation: 'landscape',
  background_color: '#FFD7A8',
  theme_color: '#FFD7A8',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2) + '\n');
// plain files only: tell GitHub Pages not to run them through Jekyll
fs.writeFileSync(path.join(ROOT, 'docs', '.nojekyll'), '');
