import { vehicles, maintenanceLogs } from '../data/demoData.js';
import { userLogStore } from '../data/userLogStore.js';

// Katalog sayfası: Marka ve motor filtrelerine göre araçları listeler
export function catalog(req, res) {
  const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
  const engine = typeof req.query.engine === 'string' ? req.query.engine : '';
  const matches = (value, filter) => !filter.trim() || value.toLowerCase().includes(filter.toLowerCase());
  const filteredVehicles = vehicles.filter(vehicle =>
    matches(vehicle.brand, brand) && matches(vehicle.engine, engine));

  res.render('vehicle/catalog', { title: 'Araç Kataloğu', vehicles: filteredVehicles, filters: { brand, engine }, hasFilters: Boolean(brand.trim() || engine.trim()) });
}

// Araç detay sayfası: Belirtilen aracın tüm teknik özelliklerini, model notunu ve kullanıcı kayıtlarını gösterir
export function detail(req, res) {
  const { brand = 'Toyota', model = 'Corolla' } = req.query;
  const vehicle = vehicles.find(item => item.brand === brand && item.model === model);
  const targetVehicle = vehicle ?? vehicles[0];

  // Kullanıcıların başka sayfada (/Maintenance/Create) girdiği verilerden bu araca ait olanları çek
  const userLogs = userLogStore.getUserLogsByVehicle(targetVehicle.brand, targetVehicle.model);

  res.render('vehicle/detail', {
    title: 'Araç Detayı',
    vehicle: targetVehicle,
    userLogs
  });
}

/**
 * Karşılaştırma Yardımcısı: URL parametresi veya formdan gelen girdiye göre aracı bulur.
 * "Toyota Corolla" tam adı, model adı veya boşluksuz aramalara esnek şekilde yanıt verir.
 */
function findVehicle(param) {
  if (!param || typeof param !== 'string') return null;
  const clean = param.trim().toLowerCase();
  return vehicles.find(v => {
    const fullName = `${v.brand} ${v.model}`.toLowerCase();
    return fullName === clean ||
           v.model.toLowerCase() === clean ||
           fullName.replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
           clean.includes(fullName);
  }) || null;
}

/**
 * Bakım Özeti Yardımcısı: Seçilen araca ait geçmiş servis kayıtlarını filtreler,
 * toplam kayıt sayısı ve ortalama bakım maliyetini hesaplayarak karşılaştırma için hazırlar.
 */
function getVehicleMaintenance(vehicle) {
  const brandLower = vehicle.brand.toLowerCase();
  const modelLower = vehicle.model.toLowerCase();
  const relatedLogs = maintenanceLogs.filter(log => {
    const logVehicle = log.vehicle.toLowerCase();
    return logVehicle.includes(brandLower) || logVehicle.includes(modelLower);
  });

  const count = relatedLogs.length;
  const totalCost = relatedLogs.reduce((acc, curr) => acc + curr.cost, 0);
  const avgCost = count > 0 ? Math.round(totalCost / count) : 3400;

  return {
    count,
    totalCost,
    avgCost,
    hasLogs: count > 0,
    logs: relatedLogs
  };
}

/**
 * Araç Karşılaştırma Özelliği Ana Kontrolcüsü (/Vehicle/Compare):
 * 1. v1 ve v2 sorgu parametrelerinden iki aracı seçer (varsayılan: Toyota Corolla & Volkswagen Golf).
 * 2. Beygir gücü farkını (powerDiff) ve model yılı farkını (yearDiff) hesaplar.
 * 3. Her iki aracın bakım istatistiklerini hesaplayıp şablona gönderir.
 */
export function compare(req, res) {
  const v1Param = typeof req.query.v1 === 'string' ? req.query.v1 : (req.query.brand1 || '');
  const v2Param = typeof req.query.v2 === 'string' ? req.query.v2 : (req.query.brand2 || '');

  let vehicle1 = findVehicle(v1Param);
  let vehicle2 = findVehicle(v2Param);

  // Hiçbir araç seçilmemişse varsayılan olarak Toyota Corolla ve Volkswagen Golf kıyaslanır
  if (!vehicle1 && !vehicle2) {
    vehicle1 = vehicles[0]; // Toyota Corolla
    vehicle2 = vehicles[1]; // Volkswagen Golf
  } else if (!vehicle1) {
    vehicle1 = vehicles.find(v => v !== vehicle2) || vehicles[0];
  } else if (!vehicle2) {
    vehicle2 = vehicles.find(v => v !== vehicle1) || vehicles[1];
  }

  // İki modelin servis ve bakım verilerini hazırla
  const v1Maintenance = getVehicleMaintenance(vehicle1);
  const v2Maintenance = getVehicleMaintenance(vehicle2);

  // Performans ve model yılı farkları
  const powerDiff = vehicle1.power - vehicle2.power;
  const yearDiff = vehicle1.year - vehicle2.year;

  res.render('vehicle/compare', {
    title: `${vehicle1.brand} ${vehicle1.model} vs ${vehicle2.brand} ${vehicle2.model} Karşılaştırması`,
    vehicles,
    vehicle1,
    vehicle2,
    v1Maintenance,
    v2Maintenance,
    powerDiff,
    yearDiff,
    v1Key: `${vehicle1.brand} ${vehicle1.model}`,
    v2Key: `${vehicle2.brand} ${vehicle2.model}`
  });
}

/**
 * RESTful JSON API Uç Noktası (/api/vehicles):
 * - İleri Web Programlama: İstemci taraflı canlı AJAX / Fetch isteklerine yanıt verir.
 * - Kullanıcı klavyeden marka veya motor yazdıkça sayfa yenilenmeden filtrelenmiş JSON veri döner.
 * - Parametreler: 'brand' (Marka adı filtresi), 'engine' (Motor adı filtresi).
 * - Büyük/küçük harf duyarsız (case-insensitive) ve boşluklardan arındırılmış (trimmed) arama uygular.
 * - Yanıt başlığında Content-Type: application/json döner.
 */
export function apiVehicles(req, res) {
  const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
  const engine = typeof req.query.engine === 'string' ? req.query.engine : '';
  const matches = (value, filter) => !filter.trim() || value.toLowerCase().includes(filter.toLowerCase().trim());

  // Kriterlere uyan araçları filtrele
  const filteredVehicles = vehicles.filter(vehicle =>
    matches(vehicle.brand, brand) && matches(vehicle.engine, engine)
  );

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({
    success: true,
    count: filteredVehicles.length,
    filters: { brand, engine },
    vehicles: filteredVehicles
  });
}
