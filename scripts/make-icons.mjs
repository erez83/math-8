// Renders public/icons/icon.svg to the PNG sizes iOS and the manifest need.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/icons/icon.svg', 'utf8');
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };
for (const [name, size] of Object.entries(sizes)) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(`public/icons/${name}`, png);
  console.log('wrote', name);
}
