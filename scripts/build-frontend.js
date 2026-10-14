import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
await mkdir('public/build/draco', { recursive: true });
await build({ entryPoints: ['frontend/home.js', 'frontend/site.js'], bundle: true, splitting: true, format: 'esm', minify: true, outdir: 'public/build', target: ['es2022'], legalComments: 'linked' });
await cp('node_modules/three/examples/jsm/libs/draco/gltf', 'public/build/draco', { recursive: true });
await cp('node_modules/three/LICENSE', 'public/build/THREE-LICENSE.txt');
console.log('Frontend hazır: public/build');
