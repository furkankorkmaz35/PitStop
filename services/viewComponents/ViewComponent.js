/**
 * @file ViewComponent.js
 * @description ViewComponent Temel Sınıfı (Base Class)
 * 
 * ASP.NET Core MVC mimarisindeki `ViewComponent` yapısının JavaScript/Node.js karşılığıdır.
 * 
 * ViewComponent vs PartialView Farkı:
 * 1. PartialView: Yalnızca kendisini çağıran ana view'dan gelen Model verisini görselleştirir.
 *    Kendi veritabanı veya hesaplama mantığı yoktur.
 * 2. ViewComponent: Sayfa controller'ından tamamen bağımsızdır. Kendi `invoke()` metoduna sahiptir.
 *    Kendi verisini bağımsız kaynaklardan (servisler, veri depoları, dış API'lar) çeker ve
 *    kendine ait component view'ına aktararak bağımsız HTML çıktısı üretir.
 */

export class ViewComponent {
  /**
   * @param {string} name - Bileşenin benzersiz adı
   */
  constructor(name) {
    if (!name) throw new Error('ViewComponent adı boş olamaz.');
    this.name = name;
  }

  /**
   * Bileşenin tetiklendiğinde çalıştıracağı iş mantığı ve veri çekme metodu.
   * Alt sınıflar bu metodu ezmeli (override etmeli) ve verilerini hazırlamalıdır.
   * 
   * @param {Object} params - Bileşene aktarılan parametreler
   * @returns {Object} { componentName, viewName, data }
   */
  invoke(params = {}) {
    throw new Error(`[${this.name}] ViewComponent sınıfı 'invoke' metodunu uygulamalıdır.`);
  }

  /**
   * Hazırlanan veriyi belirtilen bileşen görünüm şablonuna yönlendirir.
   * 
   * @param {string} viewName - Görünüm şablon adı (örn: 'quickStats')
   * @param {Object} data - Görünüme aktarılacak veri modeli
   * @returns {Object}
   */
  view(viewName, data = {}) {
    return {
      componentName: this.name,
      viewName: viewName || 'default',
      data
    };
  }
}
