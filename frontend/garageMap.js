/**
 * ==============================================================================
 * PitStop - İnteraktif Servis Haritası Modülü (Leaflet.js + OpenStreetMap)
 * ==============================================================================
 * İleri Web Programlama Dersi Kapsamında Uygulanan Teknikler:
 * 1. Web GIS & Harita Entegrasyonu: Açık kaynaklı Leaflet.js ve CartoDB Dark Matter katmanı
 * 2. Geo-Marker & Özel Pinleme (Custom HTML Icon): Otomotiv temalı şık turuncu pinler
 * 3. Harita ve Liste İki Yönlü Etkileşimi (Two-way Binding):
 *    - Haritada pine tıklanınca popup açılır ve "Sayfada Gör" ile ilgili karta kayar.
 *    - Karttaki "Haritada Gör 📍" butonuna tıklanınca harita o konuma uçar (flyTo) ve popup açılır.
 * 4. Şehir Hızlı Odaklanma (Spatial View Navigation): İstanbul, Ankara, İzmir vb. şehirlere
 *    pürüzsüz animasyonla kamera geçişi.
 * 5. Dinamik Sınır Hesaplama (FitBounds): Gösterilen servislerin tamamını ekrana sığdırma.
 */

import L from 'leaflet';

/**
 * Şehir merkezleri koordinat sözlüğü (Hızlı odaklanma butonları için)
 */
const CITY_CENTERS = {
  all: { center: [39.0, 35.2], zoom: 6 },
  istanbul: { center: [41.0082, 28.9784], zoom: 11 },
  ankara: { center: [39.9334, 32.8597], zoom: 11 },
  izmir: { center: [38.4237, 27.1428], zoom: 11 },
  bursa: { center: [40.1885, 29.0610], zoom: 11 },
  antalya: { center: [36.8969, 30.7133], zoom: 11 },
  konya: { center: [37.8746, 32.4932], zoom: 11 },
  edirne: { center: [41.6771, 26.5562], zoom: 12 }
};

/**
 * Harita pinleri için özel PitStop HTML İkonu üretir
 */
function createCustomPin(name, score) {
  return L.divIcon({
    className: 'pitstop-marker-wrapper',
    html: `
      <div class="pitstop-marker" title="${name}">
        <span class="pitstop-marker-dot"></span>
        <span class="pitstop-marker-label">★ ${score}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
  });
}

/**
 * Pin tıklandığında açılacak bilgilendirici popup içeriği
 */
function createPopupContent(garage) {
  return `
    <div class="garage-popup">
      <div class="garage-popup__badge">${garage.city} ${garage.district ? '· ' + garage.district : ''}</div>
      <h4 class="garage-popup__title">${garage.name}</h4>
      <p class="garage-popup__spec"><strong>Uzmanlık:</strong> ${garage.specialty}</p>
      <p class="garage-popup__brands"><strong>Markalar:</strong> ${garage.brands}</p>
      <div class="garage-popup__meta">
        <span class="garage-popup__score">★ ${garage.score} / 5</span>
        <span class="garage-popup__price">${garage.priceLevel || '₺₺'}</span>
      </div>
      <button type="button" class="garage-popup__btn" data-target-name="${garage.name}">
        Sayfadaki Karta Git ↓
      </button>
    </div>
  `;
}

/**
 * Haritayı başlatan ana fonksiyon
 */
export function initGarageMap() {
  const mapElement = document.getElementById('garage-map');
  if (!mapElement) return; // Sayfada harita alanı yoksa çalışma

  // 1. Şablondan aktarılan servis verilerini oku
  let garagesData = [];
  try {
    const rawData = mapElement.getAttribute('data-garages');
    if (rawData) garagesData = JSON.parse(rawData);
  } catch (err) {
    console.error('Harita verisi ayrıştırılamadı:', err);
    return;
  }

  if (!garagesData || !garagesData.length) {
    mapElement.innerHTML = '<div class="garage-map-empty">Bu arama kriterine uygun servis konumu bulunamadı.</div>';
    return;
  }

  // 2. Leaflet Haritasını Başlat (Türkiye odaklı)
  const map = L.map('garage-map', {
    center: [39.0, 35.2],
    zoom: 6,
    scrollWheelZoom: false, // Sayfa kaydırma sırasında kazara yakınlaşmayı önler
    attributionControl: true
  });

  /**
   * 3. Harita Katmanı (Tile Layer):
   * - Kesinlikle hiçbir API anahtarı (API Key), hesap veya kredi kartı gerektirmeyen
   *   %100 açık kaynaklı ve ücretsiz resmi OpenStreetMap (OSM) katmanı.
   * - Koyu tema dönüşümü CSS filtresi ile istemcide yapılır; böylece hiçbir zaman
   *   API limitlerine veya anahtar zorunluluğuna takılmaz.
   */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> katkıda bulunanlar'
  }).addTo(map);

  // 4. Servis Pinlerini Haritaya Ekle ve Referanslarını Sakla
  const markerMap = new Map();
  const latLngs = [];

  garagesData.forEach(garage => {
    if (typeof garage.lat === 'number' && typeof garage.lng === 'number') {
      const pinIcon = createCustomPin(garage.name, garage.score);
      const marker = L.marker([garage.lat, garage.lng], { icon: pinIcon })
        .bindPopup(createPopupContent(garage), { maxWidth: 280, className: 'pitstop-leaflet-popup' })
        .addTo(map);

      markerMap.set(garage.name, marker);
      latLngs.push([garage.lat, garage.lng]);
    }
  });

  // 5. Eğer tek şehir filtrelenmişse veya az pin varsa haritayı o pinlere sığdır
  if (latLngs.length === 1) {
    map.setView(latLngs[0], 12);
  } else if (latLngs.length > 1 && latLngs.length < 8) {
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }

  // 6. Şehir Hızlı Odaklanma Butonları (Quick City Navigation)
  const cityButtons = document.querySelectorAll('.map-city-btn');
  cityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      cityButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const targetCity = btn.getAttribute('data-city') || 'all';
      const cityConfig = CITY_CENTERS[targetCity];

      if (cityConfig) {
        map.flyTo(cityConfig.center, cityConfig.zoom, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
    });
  });

  // 7. Popup İçindeki "Sayfadaki Karta Git" Tıklaması
  map.on('popupopen', (e) => {
    const popupNode = e.popup.getElement();
    if (!popupNode) return;

    const goBtn = popupNode.querySelector('.garage-popup__btn');
    if (goBtn) {
      goBtn.onclick = () => {
        const garageName = goBtn.getAttribute('data-target-name');
        const cards = document.querySelectorAll('.garage-card');
        for (const card of cards) {
          const title = card.querySelector('h3');
          if (title && title.textContent.trim() === garageName.trim()) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('garage-card--highlight');
            setTimeout(() => card.classList.remove('garage-card--highlight'), 2400);

            // Detaylar kapalıysa otomatik aç
            const details = card.querySelector('.garage-card__details');
            if (details) details.open = true;
            break;
          }
        }
      };
    }
  });

  // 8. Servis Kartlarındaki "Haritada Gör 📍" Butonları ile Haritaya Uçuş
  const locateButtons = document.querySelectorAll('.garage-card__locate-btn');
  locateButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const garageName = btn.getAttribute('data-garage-name');
      const marker = markerMap.get(garageName);

      if (marker) {
        // Harita alanına yumuşak kaydır
        const mapContainer = document.getElementById('garageMapWrapper');
        if (mapContainer) {
          mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Haritada o noktaya animasyonla uç ve popup'ı aç
        const latLng = marker.getLatLng();
        map.flyTo(latLng, 14, {
          duration: 1.2
        });

        setTimeout(() => {
          marker.openPopup();
        }, 1200);
      }
    });
  });
}

// DOM yüklendiğinde haritayı başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGarageMap);
} else {
  initGarageMap();
}
