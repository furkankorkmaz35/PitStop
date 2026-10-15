/**
 * ==============================================================================
 * PitStop - Canlı AJAX / Fetch ile Anlık Araç Arama ve Filtreleme Modülü
 * ==============================================================================
 * Bu modül İleri Web Programlama standartlarına uygun olarak aşağıdaki ilkeleri uygular:
 * 1. Asenkron İstemci-Sunucu İletişimi (Modern Fetch API & async/await)
 * 2. Debounce Mekanizması: Kullanıcı yazarken her harfte sunucuya gereksiz istek
 *    göndermeyi engeller; yazma bittikten 250ms sonra tek istek atar.
 * 3. Progresif İyileştirme (Progressive Enhancement): JavaScript kapalıysa normal
 *    HTML form gönderimi (POST/GET) çalışmaya devam eder; açıksa AJAX devreye girer.
 * 4. XSS (Cross-Site Scripting) Koruması: Gelen veriler DOM'a basılmadan önce sanitize edilir.
 * 5. URL Senkronizasyonu (History API): Sayfa yenilenmese bile 'history.replaceState'
 *    ile URL güncellenir; böylece kullanıcı sayfayı yenilediğinde veya linki paylaştığında
 *    aynı filtreli görünüm korunur.
 */

/**
 * XSS Koruması için güvenli HTML kaçırma fonksiyonu
 * Kullanıcı girdilerinden veya veritabanından gelebilecek zararlı script kodlarını metne dönüştürür.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce Fonksiyonu:
 * Belirtilen süre (delay) boyunca yeni bir çağrı gelmezse asıl fonksiyonu tetikler.
 * Performansı artırır ve sunucu yükünü minimuma indirir.
 */
function debounce(func, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Tek bir aracın HTML kartını oluşturan şablon fonksiyonu
 * views/components/vehicleCard.ejs ile birebir aynı semantik yapıyı üretir.
 */
function renderVehicleCard(vehicle) {
  const brandSafe = escapeHtml(vehicle.brand);
  const modelSafe = escapeHtml(vehicle.model);
  const engineSafe = escapeHtml(vehicle.engine);
  const fuelSafe = escapeHtml(vehicle.fuel);
  const yearSafe = escapeHtml(vehicle.year);
  const powerSafe = escapeHtml(vehicle.power);
  const issueSafe = escapeHtml(vehicle.knownIssue);
  const levelSafe = escapeHtml(vehicle.issueLevel);
  const levelTone = vehicle.issueLevel === 'Düşük' ? 'tag--success' : 'tag--warning';

  const detailUrl = `/Vehicle/Detail?brand=${encodeURIComponent(vehicle.brand)}&amp;model=${encodeURIComponent(vehicle.model)}`;
  const compareUrl = `/Vehicle/Compare?v1=${encodeURIComponent(vehicle.brand + ' ' + vehicle.model)}`;

  return `
    <article class="vehicle-card">
        <div class="vehicle-card__top">
            <span class="eyebrow">${brandSafe}</span>
            <span class="muted">${yearSafe}</span>
        </div>
        <h3>${brandSafe} ${modelSafe}</h3>
        <p class="vehicle-card__engine">${engineSafe}</p>
        <dl class="vehicle-card__specs">
            <div><dt>Yakıt</dt><dd>${fuelSafe}</dd></div>
            <div><dt>Güç</dt><dd>${powerSafe} bg</dd></div>
            <div><dt>Model yılı</dt><dd>${yearSafe}</dd></div>
        </dl>
        <div class="vehicle-card__note">
            <div class="vehicle-card__note-heading">
                <span>Dikkat edilecek noktalar</span>
                <span class="tag ${levelTone}">${levelSafe}</span>
            </div>
            <p>${issueSafe}</p>
        </div>
        <div class="vehicle-card__footer">
            <a class="arrow vehicle-card__link" href="${detailUrl}" aria-label="${brandSafe} ${modelSafe} detaylarını incele">Aracı incele <span aria-hidden="true">↗</span></a>
            <!-- Bu aracı 1. araç olarak seçip karşılaştırma sayfasına aktaran kısayol linki -->
            <a class="vehicle-card__compare-link" href="${compareUrl}">Karşılaştır ⚖️</a>
        </div>
    </article>
  `;
}

/**
 * Arama sonucu boş olduğunda gösterilen şık bilgilendirme kartı
 */
function renderEmptyState(brand, engine) {
  return `
    <div class="catalog-empty">
        <span class="eyebrow">BU ARAMADA SONUÇ YOK</span>
        <h3>Başka bir aramayla deneyelim.</h3>
        <p>Girilen arama kriterleriyle eşleşen bir araç bulamadık. Daha kısa bir ifade yazabilir veya filtreleri temizleyebilirsin.</p>
        <a class="button" href="/Vehicle/Catalog" id="live-reset-btn">Tüm araçları göster</a>
    </div>
  `;
}

/**
 * Modül Başlatıcı Fonksiyon (Initialization):
 * Sayfada arama formu (.catalog-filters) varsa event listener'ları kurar.
 */
export function initCatalogLiveSearch() {
  const form = document.querySelector('.catalog-filters');
  if (!form) return; // Katalog sayfası dışındaysa çalıştırma

  const brandInput = form.querySelector('#brand');
  const engineInput = form.querySelector('#engine');
  const countBadge = document.querySelector('.catalog-count');
  const resultsContainer = document.querySelector('.section[aria-labelledby="results-title"]');
  const statusIndicator = document.getElementById('live-search-status');

  // Sonuç ızgarasını veya boş durum kapsayıcısını bul
  let gridContainer = resultsContainer ? resultsContainer.querySelector('.vehicle-grid, .catalog-empty') : null;

  /**
   * Sunucuya AJAX Fetch isteği atan ve arayüzü güncelleyen ana fonksiyon
   */
  async function performLiveSearch() {
    const brand = brandInput ? brandInput.value.trim() : '';
    const engine = engineInput ? engineInput.value.trim() : '';

    // Kullanıcıya arama yapıldığını hissettiren görsel yükleniyor durumu
    if (statusIndicator) {
      statusIndicator.textContent = '⏳ Filtreleniyor...';
      statusIndicator.className = 'catalog-live-status catalog-live-status--loading';
    }

    try {
      // 1. REST API'ye asenkron GET isteği gönder
      const params = new URLSearchParams();
      if (brand) params.set('brand', brand);
      if (engine) params.set('engine', engine);

      const apiUrl = `/api/vehicles?${params.toString()}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);

      // 2. Gelen JSON verisini ayrıştır
      const data = await response.json();
      const vehicles = data.vehicles || [];

      // 3. Sonuç sayacı rozetini güncelle
      if (countBadge) {
        countBadge.textContent = `${vehicles.length} araç`;
      }

      // 4. URL'yi sayfa yenilenmeden History API ile güncelle (Bookmark/Share desteği)
      const pageUrl = params.toString() ? `/Vehicle/Catalog?${params.toString()}` : '/Vehicle/Catalog';
      window.history.replaceState({ brand, engine }, '', pageUrl);

      // 5. Araç kartları ızgarasını güncelle
      const currentGrid = resultsContainer.querySelector('.vehicle-grid');
      const currentEmpty = resultsContainer.querySelector('.catalog-empty');

      if (vehicles.length > 0) {
        const cardsHtml = vehicles.map(renderVehicleCard).join('');
        if (currentGrid) {
          currentGrid.innerHTML = cardsHtml;
        } else if (currentEmpty) {
          const newGrid = document.createElement('div');
          newGrid.className = 'vehicle-grid';
          newGrid.innerHTML = cardsHtml;
          currentEmpty.replaceWith(newGrid);
        }
      } else {
        const emptyHtml = renderEmptyState(brand, engine);
        if (currentGrid) {
          const emptyDiv = document.createElement('div');
          emptyDiv.innerHTML = emptyHtml;
          currentGrid.replaceWith(emptyDiv.firstElementChild);
        } else if (currentEmpty) {
          currentEmpty.outerHTML = emptyHtml;
        }

        // Boş durumdaki "Tüm araçları göster" butonuna tıklanınca formları temizle
        const resetBtn = document.getElementById('live-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (brandInput) brandInput.value = '';
            if (engineInput) engineInput.value = '';
            performLiveSearch();
          });
        }
      }

      // 6. Başarılı durum bildirimi
      if (statusIndicator) {
        statusIndicator.textContent = `⚡ Canlı Filtrelendi (${vehicles.length} araç)`;
        statusIndicator.className = 'catalog-live-status';
      }
    } catch (error) {
      console.error('Canlı arama hatası:', error);
      if (statusIndicator) {
        statusIndicator.textContent = '⚠️ Bağlantı hatası';
        statusIndicator.className = 'catalog-live-status catalog-live-status--error';
      }
    }
  }

  // Kullanıcı her tuşa bastığında 250ms debounce ile aramayı tetikle
  const debouncedSearch = debounce(performLiveSearch, 250);

  if (brandInput) {
    brandInput.addEventListener('input', debouncedSearch);
  }
  if (engineInput) {
    engineInput.addEventListener('input', debouncedSearch);
  }

  // Formun enter veya submit ile gereksiz sayfa yenilemesini engelleyip canlı aramayı çalıştır
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performLiveSearch();
  });
}
