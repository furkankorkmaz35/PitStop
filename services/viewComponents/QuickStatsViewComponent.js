/**
 * @file QuickStatsViewComponent.js
 * @description Hızlı İstatistik ve Platform Özeti ViewComponent'i
 * 
 * Bu ViewComponent, PitStop genelindeki tüm verileri (katalogdaki araçlar, örnek bakım kayıtları,
 * kullanıcıların sisteme eklediği gerçek/canlı bakım kayıtları ve servisler) bağımsız olarak sorgular,
 * metrikleri ve maliyet ortalamalarını hesaplar.
 * 
 * Uygun Senaryolar (Kullanım Alanları):
 * 1. Ana Sayfa (/Home/Index): Ziyaretçilere platformun büyüklüğünü ve güncel canlı verilerini göstermek.
 * 2. Bakım Kayıtları (/Maintenance/Logs): Genel bakım kayıtları ile kullanıcı girdilerinin birleşik özetini sunmak.
 * 3. Yeni Kayıt Ekleme Sayfası (/Maintenance/Create): Kullanıcıya sisteme eklenen toplam kayıt sayısını ve metrikleri göstermek.
 */

import { ViewComponent } from './ViewComponent.js';
import { vehicles, maintenanceLogs, garages } from '../../data/demoData.js';
import { userLogStore } from '../../data/userLogStore.js';

export class QuickStatsViewComponent extends ViewComponent {
  constructor() {
    super('QuickStats');
  }

  /**
   * Bağımsız iş mantığı: Veri depolarından metrikleri toplar ve hesaplar.
   * Controller'a ihtiyaç duymadan doğrudan çalışır.
   * 
   * @param {Object} params - Opsiyonel parametreler (title, compact vb.)
   * @returns {Object} Görünüm modeli
   */
  invoke(params = {}) {
    const userLogs = userLogStore.getAllUserLogs();
    const totalVehicles = vehicles.length;
    const totalSystemLogs = maintenanceLogs.length;
    const totalUserLogs = userLogs.length;
    const totalCombinedLogs = totalSystemLogs + totalUserLogs;

    // Toplam sistem ve kullanıcı bakım harcamaları
    const systemCost = maintenanceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
    const userCost = userLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
    const totalCost = systemCost + userCost;

    // Ortalama bakım maliyeti (₺)
    const avgCost = totalCombinedLogs > 0 ? Math.round(totalCost / totalCombinedLogs) : 0;

    const viewModel = {
      title: params.title || 'Platform Canlı İstatistikleri',
      totalVehicles,
      totalLogs: totalCombinedLogs,
      systemLogsCount: totalSystemLogs,
      userLogsCount: totalUserLogs,
      totalCost,
      avgCost,
      totalGarages: garages.length,
      compact: Boolean(params.compact)
    };

    return this.view('quickStats', viewModel);
  }
}
