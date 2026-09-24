// node tools/make-icons.mjs → docs/icon-180.png, icon-192.png, icon-512.png
// A Wanderbean on sunny yellow, drawn with signed distance fields so it needs no image library.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT } from './assemble.mjs';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const BG = hex('#FFC83D'), INK = hex('#2B2040'), BEAN = hex('#FF5D73'), BELLY = hex('#FFA3B1'),
  WHITE = hex('#FFFFFF'), PUPIL = hex('#1D1533'), GOLD = hex('#E3B04B'), LENS = hex('#9FE8FF'), BLUSH = hex('#FF8FA8');

// shapes in a 0..1 square, y down; each returns a signed distance (negative inside)
const circle = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r;
const ellipse = (cx, cy, rx, ry) => (x, y) => (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry);
const capsule = (cx, y0, y1, r) => (x, y) => Math.hypot(x - cx, y - Math.max(y0, Math.min(y1, y))) - r;
const segment = (ax, ay, bx, by, r) => (x, y) => {
  const px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - dx * t, py - dy * t) - r;
};
const OL = 0.022; // ink outline width

// painter's order: [shape, fill, outline?]
const layers = [
  [segment(0.5, 0.25, 0.5, 0.12, 0.012), INK, false],       // antenna stalk
  [capsule(0.5, 0.1, 0.1, 0.075), GOLD, true],             // spyglass (seen end-on, fat)
  [circle(0.5, 0.1, 0.035), LENS, false],
  [capsule(0.5, 0.42, 0.66, 0.25), BEAN, true],            // body
  [ellipse(0.5, 0.72, 0.16, 0.13), BELLY, false],
  [ellipse(0.42, 0.42, 0.065, 0.08), WHITE, true],         // eyes
  [ellipse(0.58, 0.42, 0.065, 0.08), WHITE, true],
  [circle(0.435, 0.43, 0.034), PUPIL, false],
  [circle(0.595, 0.43, 0.034), PUPIL, false],
  [ellipse(0.33, 0.53, 0.04, 0.022), BLUSH, false],
  [ellipse(0.67, 0.53, 0.04, 0.022), BLUSH, false],
];

function render(size) {
  const px = new Uint8Array(size * size * 3);
  const aa = 1.2 / size;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const x = (i + 0.5) / size, y = (j + 0.5) / size;
    let c = BG.slice();
    const mix = (col, a) => { if (a > 0) c = c.map((v, k) => v + (col[k] - v) * a); };
    for (const [sdf, fill, ol] of layers) {
      const d = sdf(x, y);
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
