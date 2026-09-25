// node tools/make-icons.mjs → docs/icon-180.png, icon-192.png, icon-512.png
// A Wanderbean on sunny yellow, drawn with signed distance fields so it needs no image library.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT } from './assemble.mjs';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const BG = hex('#FFC83D'), INK = hex('#2B2040'), BEAN = hex('#5CC8E6'), WHITE = hex('#FFFFFF'), PUPIL = hex('#1D1533'),
  BLUSH = hex('#FFB0C4'), MOUTH = hex('#C8324F'), TONGUE = hex('#FF8FA8');

// shapes in a 0..1 square, y down; each returns a signed distance (negative inside)
const circle = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r;
const ellipse = (cx, cy, rx, ry) => (x, y) => (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
const capsule = (cx, y0, y1, r) => (x, y) => Math.hypot(x - cx, y - Math.max(y0, Math.min(y1, y))) - r;
const segment = (ax, ay, bx, by, r) => (x, y) => {
  const px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - dx * t, py - dy * t) - r;
};
const below = (f, y0) => (x, y) => Math.max(f(x, y), y0 - y);   // only the part of a shape under a line
const OL = 0.018; // ink outline width

// the Wanderbean mascot: an egg-shaped body with a big white face, waving
const layers = [
  [ellipse(0.39, 0.875, 0.085, 0.05), BEAN, true],              // feet
  [ellipse(0.61, 0.875, 0.085, 0.05), BEAN, true],
  [segment(0.285, 0.52, 0.245, 0.69, 0.062), BEAN, true],       // arm down
  [segment(0.715, 0.5, 0.82, 0.3, 0.062), BEAN, true],          // arm up, waving
  [capsule(0.5, 0.43, 0.62, 0.255), BEAN, true],                // body
  [ellipse(0.5, 0.405, 0.185, 0.145), WHITE, false],            // face
  [ellipse(0.435, 0.39, 0.03, 0.04), PUPIL, false],             // eyes
  [ellipse(0.565, 0.39, 0.03, 0.04), PUPIL, false],
  [circle(0.425, 0.374, 0.011), WHITE, false],
  [circle(0.555, 0.374, 0.011), WHITE, false],
  [ellipse(0.37, 0.445, 0.03, 0.016), BLUSH, false],            // cheeks
  [ellipse(0.63, 0.445, 0.03, 0.016), BLUSH, false],
  [below(ellipse(0.5, 0.445, 0.045, 0.045), 0.445), MOUTH, false],   // open smile
  [below(ellipse(0.5, 0.475, 0.026, 0.014), 0.465), TONGUE, false],
];

function render(size) {
  const px = new Uint8Array(size * size * 3);
  const aa = 1.2 / size;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const x = (i + 0.5) / size, y = (j + 0.5) / size;
    let c = BG.slice();
    const mix = (col, a) => { if (a > 0) c = c.map((v, k) => v + (col[k] - v) * a); };
    for (const [sdf, fill, ol] of layers) {
      const K = 0.84, d = sdf(0.5 + (x - 0.5) / K, 0.55 + (y - 0.5) / K) * K;   // shrunk a little so round icon masks don't clip the feet
      if (ol) mix(INK, Math.max(0, Math.min(1, 0.5 - (d - OL) / aa)));
      mix(fill, Math.max(0, Math.min(1, 0.5 - d / aa)));
    }
    px.set(c.map(Math.round), (j * size + i) * 3);
  }
  return png(size, size, px);
}

function png(w, h, rgb) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = buf => { let c = 0xFFFFFFFF; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cr]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; Buffer.from(rgb.buffer, y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const dir = path.join(ROOT, 'docs');
fs.mkdirSync(dir, { recursive: true });
for (const s of [180, 192, 512]) {
  const f = path.join(dir, `icon-${s}.png`);
  fs.writeFileSync(f, render(s));
  console.log('wrote', path.relative(ROOT, f));
}
