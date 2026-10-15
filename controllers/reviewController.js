import { partReviews as reviews, garages } from '../data/demoData.js';

/**
 * ==============================================================================
 * Servis Koordinat Haritası (İleri Web Programlama - Coğrafi Bilgi / Harita Modeli)
 * ==============================================================================
 * Demo veri setindeki 9 servisin Türkiye haritası üzerindeki gerçek koordinatları (Enlem / Boylam).
 * Leaflet.js ve OpenStreetMap üzerinde pinleme yapmak için kullanılır.
 */
export const garageCoordinates = {
  'Usta Garaj': { lat: 40.9922, lng: 29.0284, city: 'İstanbul', district: 'Kadıköy' },
  'Anadolu Oto Servis': { lat: 39.9208, lng: 32.8541, city: 'Ankara', district: 'Çankaya' },
  'Ege Motor': { lat: 38.4635, lng: 27.2163, city: 'İzmir', district: 'Bornova' },
  'Marmara Mekanik': { lat: 40.2132, lng: 28.9664, city: 'Bursa', district: 'Nilüfer' },
  'Boğaz Oto Elektrik': { lat: 41.0253, lng: 29.0162, city: 'İstanbul', district: 'Üsküdar' },
  'Başkent Dizel Servis': { lat: 39.9674, lng: 32.7932, city: 'Ankara', district: 'Yenimahalle' },
  'Akdeniz Oto Bakım': { lat: 36.8865, lng: 30.7053, city: 'Antalya', district: 'Muratpaşa' },
  'Konya Motor Atölyesi': { lat: 37.9152, lng: 32.5084, city: 'Konya', district: 'Selçuklu' },
  'Trakya Yetkin Servis': { lat: 41.6771, lng: 26.5562, city: 'Edirne', district: 'Merkez' }
};

/**
 * Servis nesnelerine harita pinleme için enlem ve boylam (lat/lng) koordinatlarını ekler
 */
function enrichGarageWithCoords(garage) {
  const coords = garageCoordinates[garage.name] || { lat: 39.0, lng: 35.0, city: garage.city, district: '' };
  return {
    ...garage,
    lat: coords.lat,
    lng: coords.lng,
    district: coords.district
  };
}

// Parça incelemeleri sayfasını render eder
export function partReviews(req, res) {
  res.render('review/partReviews', { title: 'Parça İncelemeleri', reviews });
}

/**
 * Servis Bul Sayfası Kontrolcüsü (/Review/GarageFinder):
 * - Şehir, marka ve uzmanlık filtrelerine göre servisleri süzer.
 * - Harita entegrasyonu için filtrelenmiş servislere enlem/boylam koordinatlarını iliştirir.
 * - Hem MVC şablonuna hem de harita bileşenine hazır veri sunar.
 */
export function garageFinder(req, res) {
  const city = typeof req.query.city === 'string' ? req.query.city : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
  const specialty = typeof req.query.specialty === 'string' ? req.query.specialty : '';
  const normalizedCity = city.trim().toLocaleLowerCase('tr-TR');
  const normalizedBrand = brand.trim().toLocaleLowerCase('tr-TR');
  const normalizedSpecialty = specialty.trim().toLocaleLowerCase('tr-TR');

  const filteredGarages = garages.filter(garage => {
    const cityMatches = !normalizedCity || garage.city.toLocaleLowerCase('tr-TR').includes(normalizedCity);
    const brandMatches = !normalizedBrand || garage.brands.toLocaleLowerCase('tr-TR').includes(normalizedBrand);
    const specialtyMatches = !normalizedSpecialty || garage.specialty.toLocaleLowerCase('tr-TR').includes(normalizedSpecialty)
      || garage.services.some(service => service.toLocaleLowerCase('tr-TR').includes(normalizedSpecialty));
    return cityMatches && brandMatches && specialtyMatches;
  });

  // Harita pinleri için koordinatlı servis listesi
  const garagesWithCoords = filteredGarages.map(enrichGarageWithCoords);
  const hasFilter = Boolean(normalizedCity || normalizedBrand || normalizedSpecialty);

  res.render('review/garageFinder', {
    title: 'Servis Bul',
    garages: garagesWithCoords,
    garagesWithCoords,
    filters: { city, brand, specialty },
    hasFilter
  });
}

/**
 * RESTful JSON API Uç Noktası (/api/garages):
 * - İleri Web Programlama: Harita ve istemci uygulamaları için coğrafi konumlu servis verilerini döner.
 * - İstemci taraflı harita bileşeni (Leaflet.js) bu API üzerinden dinamik sorgulama yapabilir.
 */
export function apiGarages(req, res) {
  const city = typeof req.query.city === 'string' ? req.query.city.trim().toLocaleLowerCase('tr-TR') : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim().toLocaleLowerCase('tr-TR') : '';

  const filtered = garages.filter(garage => {
    const cityMatches = !city || garage.city.toLocaleLowerCase('tr-TR').includes(city);
    const brandMatches = !brand || garage.brands.toLocaleLowerCase('tr-TR').includes(brand);
    return cityMatches && brandMatches;
  }).map(enrichGarageWithCoords);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({
    success: true,
    count: filtered.length,
    filters: { city, brand },
    garages: filtered
  });
}
