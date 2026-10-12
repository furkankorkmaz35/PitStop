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

test('default routes show the catalog', async () => {
  for (const path of ['/', '/Vehicle', '/vehicle/catalog/']) {
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
    assert.ok(detail.includes(`<h1>${query.get('brand')} ${query.get('model')}</h1>`));
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
