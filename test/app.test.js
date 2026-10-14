import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import app from '../app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function page(path) {
  const response = await fetch(baseUrl + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type'), /text\/html/);
  return response.text();
}

test('six existing pages render their content and shared layout', async () => {
  const pages = [
    ['/Vehicle/Catalog', 'Toyota Corolla'],
    ['/Vehicle/Detail', '1.6 Valvematic'],
    ['/Maintenance/Logs', 'Toplam ₺10.750'],
    ['/Maintenance/Guide', 'Hava filtresi kontrolü'],
    ['/Review/PartReviews', 'Ön fren balatası'],
    ['/Review/GarageFinder', 'Anadolu Oto Servis']
  ];
  for (const [path, content] of pages) {
    const html = await page(path);
    assert.ok(html.includes(content), path);
    assert.ok(html.includes('aria-label="Ana menü"'));
    assert.ok(html.includes('Örnek veriler eğitim amaçlıdır.'));
    assert.doesNotMatch(html, /<%|asp-controller|@Model/);
  }
});

test('vehicle routes still show the catalog', async () => {
  for (const path of ['/Vehicle', '/vehicle/catalog/']) {
    assert.match(await page(path), /4 araç/);
  }
});

test('brand and engine filters combine and ignore letter case', async () => {
  const html = await page('/Vehicle/Catalog?brand=volks&engine=tdi');
  assert.match(html, /1 araç/);
  assert.match(html, /Volkswagen Golf/);
  assert.doesNotMatch(html, /Toyota Corolla/);
  assert.match(await page('/Vehicle/Catalog?brand=Toyota&engine=TDI'), /0 araç/);
  assert.match(await page('/Vehicle/Catalog?brand=%20%20'), /4 araç/);
});

test('catalog detail links open the selected vehicle', async () => {
  const html = await page('/Vehicle/Catalog');
  const links = [...html.matchAll(/href="(\/Vehicle\/Detail\?[^\"]+)"/g)];
  assert.equal(links.length, 4);
  for (const [, escapedLink] of links) {
    const link = escapedLink.replaceAll('&amp;', '&');
    const query = new URL(link, baseUrl).searchParams;
    const detail = await page(link);
    assert.ok(detail.includes(`<h1 id="vehicle-title">${query.get('brand')} ${query.get('model')}</h1>`));
  }
});

test('unknown vehicle preserves the original default vehicle behavior', async () => {
  assert.match(await page('/Vehicle/Detail?brand=Unknown&model=Unknown'), /Toyota Corolla/);
});

test('city filter returns matching garages and allows empty results', async () => {
  const html = await page('/Review/GarageFinder?city=ankara');
  assert.match(html, /Anadolu Oto Servis/);
  assert.doesNotMatch(html, /Usta Garaj|Ege Motor/);
  const empty = await page('/Review/GarageFinder?city=Unknown');
  assert.doesNotMatch(empty, /Anadolu Oto Servis|Usta Garaj|Ege Motor/);
});

test('stylesheet is served without modification', async () => {
  const response = await fetch(baseUrl + '/css/site.css');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/css/);
  assert.equal(await response.text(), await readFile(new URL('../public/css/site.css', import.meta.url), 'utf8'));
});

 test('home and about introduce the project separately from the catalog', async () => {
  for (const path of ['/', '/Home', '/Home/Index']) {
    const html = await page(path);
    assert.match(html, /PITSTOP NEDİR/);
    assert.match(html, /href="\/Vehicle\/Catalog"/);
    assert.doesNotMatch(html, /name="brand"/);
  }
  const about = await page('/Home/About');
  assert.match(about, /Bir eğitim projesi/);
  assert.match(about, /gerçek/i);
});

test('3D assets are local and the scene is limited to the home page', async () => {
  const home = await page('/');
  assert.match(home, /data-car-stage/);
  assert.match(home, /vehicle-outline\.svg/);
  assert.match(home, /src="\/build\/home\.js"/);
  for (const path of ['/Home/About', '/Vehicle/Catalog', '/Maintenance/Logs', '/Review/PartReviews']) {
    assert.doesNotMatch(await page(path), /\/build\/home\.js/);
  }
  for (const path of ['/build/home.js', '/build/draco/draco_wasm_wrapper.js', '/build/draco/draco_decoder.wasm']) {
    const response = await fetch(baseUrl + path);
    assert.equal(response.status, 200, path);
  }
  const model = await fetch(baseUrl + '/models/ferrari.glb');
  assert.equal(model.status, 200);
  const bytes = Buffer.from(await model.arrayBuffer());
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
});


test('catalog preserves filters and provides an escaped empty state', async () => {
  const html = await page('/Vehicle/Catalog?brand=Toyota&engine=Valvematic');
  assert.match(html, /value="Toyota"/);
  assert.match(html, /value="Valvematic"/);
  assert.match(html, /1 araç/);
  const empty = await page('/Vehicle/Catalog?brand=%3Cscript%3E');
  assert.match(empty, /0 araç/);
  assert.match(empty, /Başka bir aramayla/);
  assert.match(empty, /value="&lt;script&gt;"/);
  assert.doesNotMatch(empty, /<script>/);
  assert.match(empty, /Tüm araçları göster/);
});


test('vehicle detail shows selected specifications and honest resource links', async () => {
  const html = await page('/Vehicle/Detail?brand=Volkswagen&model=Golf');
  for (const value of ['Volkswagen Golf', '1.6 TDI', '105', 'Dizel', '2014', 'EGR ve DPF']) assert.ok(html.includes(value));
  assert.match(html, /Gerçek kullanıcı katkısı/);
  assert.match(html, /href="\/Maintenance\/Guide"/);
  assert.match(html, /href="\/Vehicle\/Catalog"/);
  assert.doesNotMatch(html, /Toyota Corolla|Kullanıcıların dikkat çektiği/);
});
