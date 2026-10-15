import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';

await mkdir('public/build/draco', { recursive: true });
await mkdir('public/build/leaflet', { recursive: true });

// Esbuild ile frontend modüllerini derle
await build({
  entryPoints: ['frontend/home.js', 'frontend/site.js', 'frontend/garageMap.js'],
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  outdir: 'public/build',
  target: ['es2022'],
  legalComments: 'linked'
});

// Statik kütüphane varlıklarını kopyala
await cp('node_modules/three/examples/jsm/libs/draco/gltf', 'public/build/draco', { recursive: true });
await cp('node_modules/three/LICENSE', 'public/build/THREE-LICENSE.txt');
await cp('node_modules/leaflet/dist/leaflet.css', 'public/build/leaflet/leaflet.css');
await cp('node_modules/leaflet/dist/images', 'public/build/leaflet/images', { recursive: true });

console.log('Frontend hazır: public/build (Three.js, Draco ve Leaflet entegre)');
