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
    ['/Maintenance/Logs', 'Toplam ₺23.900'],
    ['/Maintenance/Guide', 'Hava filtresini gözle kontrol et'],
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
  assert.match(await page('/Vehicle/Catalog?brand=%20%20'), /14 araç/);
});

test('catalog detail links open the selected vehicle', async () => {
  const html = await page('/Vehicle/Catalog');
  const links = [...html.matchAll(/href="(\/Vehicle\/Detail\?[^\"]+)"/g)];
  assert.equal(links.length, 14);
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

test('garage search handles Turkish casing, whitespace and escaped filter values', async () => {
  const html = await page('/Review/GarageFinder?city=' + encodeURIComponent(' istanbul '));
  assert.match(html, /Usta Garaj/);
  assert.match(html, /2 servis/);
  assert.match(html, /value=" istanbul "/);
  assert.doesNotMatch(html, /Anadolu Oto Servis|Ege Motor/);
  assert.match(await page('/Review/GarageFinder?city=' + encodeURIComponent('İZMİR')), /Ege Motor/);
  const empty = await page('/Review/GarageFinder?city=%3Cscript%3E');
  assert.match(empty, /0 servis/);
  assert.match(empty, /value="&lt;script&gt;"/);
  assert.match(empty, /Tüm servisleri göster/);
  assert.doesNotMatch(empty, /<script>/);
});

test('navigation indicates current page and vehicle detail keeps catalog context', async () => {
  for (const [path, href] of [
    ['/', '/'], ['/vehicle/catalog/?brand=Toyota', '/Vehicle/Catalog'],
    ['/Maintenance/Logs', '/Maintenance/Logs'], ['/Review/GarageFinder?city=ankara', '/Review/GarageFinder']
  ]) {
    const html = await page(path);
    assert.ok(html.includes(`href="${href}" aria-current="page"`));
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  }
  assert.ok((await page('/Vehicle/Detail')).includes('href="/Vehicle/Catalog" aria-current="true"'));
  assert.equal((await fetch(baseUrl + '/build/site.js')).status, 200);
});



test('maintenance log generates individual downloadable PDF document', async () => {
  const html = await page('/Maintenance/Logs');
  assert.match(html, /\/Maintenance\/Logs\/1\/pdf/);
  assert.match(html, /Belge Çıkart/);

  const response = await fetch(baseUrl + '/Maintenance/Logs/1/pdf');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  const disposition = response.headers.get('content-disposition');
  assert.match(disposition, /PitStop-Bakim-Kaydi-1/);

  const buffer = Buffer.from(await response.arrayBuffer());
  assert.ok(buffer.length > 5000);
  assert.equal(buffer.toString('ascii', 0, 4), '%PDF');

  const notFound = await fetch(baseUrl + '/Maintenance/Logs/999/pdf', { redirect: 'manual' });
  assert.ok([404, 302].includes(notFound.status));
});

// Karşılaştırma Testi: Varsayılan araçların (Toyota vs Golf) başarıyla yüklendiğini,
// güç farkı rozetinin (+27 bg) ve kıyaslama analizlerinin doğru üretildiğini doğrular.
test('vehicle comparison renders default vehicles and calculates side-by-side differences', async () => {
  const html = await page('/Vehicle/Compare');
  assert.ok(html.includes('Toyota Corolla'));
  assert.ok(html.includes('Volkswagen Golf'));
  assert.ok(html.includes('132 bg'));
  assert.ok(html.includes('105 bg'));
  assert.ok(html.includes('+27 bg daha güçlü'));
  assert.ok(html.includes('Performans &amp; Çekiş') || html.includes('Performans & Çekiş'));
  assert.ok(html.includes('action="/Vehicle/Compare"'));
});

// Karşılaştırma Testi: URL üzerinden özel v1 ve v2 sorgu parametreleri verildiğinde (Örn: BMW 3 Serisi vs Honda Civic)
// ilgili araçların dinamik olarak eşleşip ekrana yansıtıldığını doğrular.
test('vehicle comparison accepts query parameters for custom vehicles', async () => {
  const html = await page('/Vehicle/Compare?v1=BMW%203%20Serisi&v2=Honda%20Civic');
  assert.ok(html.includes('BMW 3 Serisi'));
  assert.ok(html.includes('Honda Civic'));
  assert.ok(html.includes('184 bg'));
  assert.ok(html.includes('+59 bg daha güçlü') || html.includes('BMW 3 Serisi vs Honda Civic'));
});

// İleri Web Programlama API Testi:
// /api/vehicles RESTful JSON uç noktasının doğru başlıklarla (application/json),
// doğru filtreleme mantığıyla ve JSON veri formatıyla çalıştığını doğrular.
test('API /api/vehicles returns filtered json data with proper headers', async () => {
  // 1. Tüm araçlar sorgusu
  const allResponse = await fetch(baseUrl + '/api/vehicles');
  assert.equal(allResponse.status, 200);
  assert.match(allResponse.headers.get('content-type'), /application\/json/);
  const allData = await allResponse.json();
  assert.equal(allData.success, true);
  assert.equal(allData.count, 14);
  assert.equal(allData.vehicles.length, 14);

  // 2. Filtreli sorgu (Toyota)
  const toyotaResponse = await fetch(baseUrl + '/api/vehicles?brand=Toyota');
  const toyotaData = await toyotaResponse.json();
  assert.equal(toyotaData.count, 1);
  assert.equal(toyotaData.vehicles[0].brand, 'Toyota');
  assert.equal(toyotaData.vehicles[0].model, 'Corolla');

  // 3. Eşleşmeyen sorgu (0 sonuç)
  const emptyResponse = await fetch(baseUrl + '/api/vehicles?brand=OlmayanMarka');
  const emptyData = await emptyResponse.json();
  assert.equal(emptyData.count, 0);
  assert.equal(emptyData.vehicles.length, 0);
});
