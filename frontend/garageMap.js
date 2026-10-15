/**
 * ==============================================================================
 * PitStop - İnteraktif Servis Haritası Modülü (Leaflet.js + OpenStreetMap)
 * ==============================================================================
 * İleri Web Programlama Dersi Kapsamında Uygulanan Teknikler:
 * 1. Web GIS & Harita Entegrasyonu: %100 açık kaynaklı ve API anahtarı istemeyen resmi OpenStreetMap katmanı
 * 2. Geo-Marker & Özel Pinleme (Custom HTML Icon): Otomotiv temalı şık turuncu pinler
 * 3. Garantili 60FPS Pürüzsüz Sayfa Kaydırma (Custom RequestAnimationFrame Smooth Scroll):
 *    Tarayıcıların 'scrollIntoView' metodundaki anlık ışınlanma (teleport/snap) sorununu
 *    ortadan kaldıran kübik bezier (easeInOutCubic) matematiksel kaydırma algoritması.
 * 4. İki Yönlü Sinematik Etkileşim (Two-Way Sequential Binding):
 *    - Haritada pine tıklanınca sayfa karta pürüzsüzce kayar, kart parlar ve detaylar açılır.
 *    - Karttaki "Haritada Gör 📍" butonuna basılınca sayfa haritaya kayar, ardından kamera
 *      servis koordinatlarına zarifçe süzülür (flyTo) ve iniş anında popup açılır.
 * 5. Şehir Hızlı Odaklanma (Spatial View Navigation): Şehirlere pürüzsüz kamera uçuşu.
 */

import L from 'leaflet';

/**
 * Özel Pürüzsüz Sayfa Kaydırma Motoru (Custom 60FPS Easing Scroll):
 * - Neden Yapıldı? Bazı tarayıcılarda 'scrollIntoView({ behavior: 'smooth' })' anlık
 *   ışınlanma (teleport) yapabilir veya diğer animasyonlarla çakışabilir.
 * - Bu fonksiyon, window.requestAnimationFrame ve kübik bezier eğrisi (easeInOutCubic)
 *   kullanarak sayfayı piksel piksel, yağ gibi kaydırır ve bitiş anında callback çalıştırır.
 */
function smoothScrollTo(element, offset = 30, duration = 650, callback = null) {
  if (!element) return;
  const startY = window.pageYOffset || document.documentElement.scrollTop;
  const elementRect = element.getBoundingClientRect();
  const targetY = Math.max(0, elementRect.top + startY - offset);
  const distance = targetY - startY;

  // Zaten o konumdaysak doğrudan callback'i tetikle
  if (Math.abs(distance) < 8) {
    if (typeof callback === 'function') callback();
    return;
  }

  let startTime = null;

  // Kübik pürüzsüz hızlanma ve yavaşlama eğrisi
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startY + (distance * ease));

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  window.requestAnimationFrame(step);
}

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
  if (!mapElement) return;

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
    scrollWheelZoom: false,
    attributionControl: true
  });

  /**
   * 3. Harita Katmanı (Tile Layer):
   * %100 açık kaynaklı ve API anahtarı istemeyen resmi OpenStreetMap (OSM) katmanı.
   * review.css içindeki CSS invert/hue-rotate filtreleri ile PitStop koyu temasına uyarlandı.
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

  // 5. Filtreli görünümde haritayı pin sınırlarına sığdır
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
          duration: 1.4,
          easeLinearity: 0.25
        });
      }
    });
  });

  /**
   * 7. Haritadan Karta Geçiş (Harita -> Liste İki Yönlü Bağlantısı):
   * - Harita popup'ındaki "Sayfadaki Karta Git" butonuna basıldığında custom 60FPS
   *   smoothScrollTo motoru ile sayfa ışınlanmadan, akıcı bir şekilde karta kayar.
   * - Kartın hizasına ulaştığında turuncu çerçeve parlar ve detay akordeonu açılır.
   */
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
            // Sayfayı karta 650ms kübik eğri ile kaydır
            smoothScrollTo(card, 70, 650, () => {
              card.classList.add('garage-card--highlight');
              const details = card.querySelector('.garage-card__details');
              if (details) details.open = true;

              setTimeout(() => card.classList.remove('garage-card--highlight'), 2800);
            });
            break;
          }
        }
      };
    }
  });

  /**
   * 8. Karttan Haritaya Geçiş (Liste -> Harita İki Yönlü Bağlantısı):
   * ==========================================================================
   * Işınlanmayı Önleyen 2 Aşamalı Sinematik Sıralama:
   * 1. Aşama: Sayfa önce harita alanına 600ms boyunca pürüzsüzce kayar.
   * 2. Aşama: Sayfa haritaya yerleşince Leaflet kamerasını yumuşakça (1.5s) servise uçurur.
   * 3. Aşama: Kamera servisin üzerinde durduğu an popup açılır.
   */
  const locateButtons = document.querySelectorAll('.garage-card__locate-btn');
  locateButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const garageName = btn.getAttribute('data-garage-name');
      const marker = markerMap.get(garageName);

      if (marker) {
        const mapContainer = document.getElementById('garageMapWrapper');

        // 1. Aşama: Sayfayı harita konteynerine 600ms pürüzsüzce kaydır
        smoothScrollTo(mapContainer, 24, 600, () => {
          // 2. Aşama: Sayfa haritaya ulaştıktan sonra harita kamerasını zarifçe uçur
          const latLng = marker.getLatLng();

          // Kamera tam yerine oturduğunda popup'ı aç
          map.once('moveend', () => {
            marker.openPopup();
          });

          // Sinematik, sarsıntısız ve yumuşak uçuş
          map.flyTo(latLng, 14, {
            duration: 1.5,
            easeLinearity: 0.25
          });
        });
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
