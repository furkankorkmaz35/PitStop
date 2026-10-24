/**
 * @file RecentActivityViewComponent.js
 * @description Son Topluluk Aktiviteleri ViewComponent'i
 * 
 * Bu ViewComponent, kullanıcıların site üzerindeki form aracılığıyla girdiği en son
 * bakım ve deneyim kayıtlarını bağımsız olarak çeker ve bir akış halinde listeler.
 * 
 * Uygun Senaryolar:
 * 1. Yeni Kayıt Sayfası (/Maintenance/Create): Kullanıcı form doldururken diğer kullanıcıların son paylaşımlarını görmesi için.
 * 2. Ana Sayfa veya Bakım Kayıtları: Canlı etkileşim akışını göstermek için.
 */

import { ViewComponent } from './ViewComponent.js';
import { userLogStore } from '../../data/userLogStore.js';

export class RecentActivityViewComponent extends ViewComponent {
  constructor() {
    super('RecentActivity');
  }

  /**
   * Bağımsız iş mantığı: En son eklenen kayıtları çeker.
   * 
   * @param {Object} params - limit: Gösterilecek aktivite sayısı (varsayılan 3)
   * @returns {Object} Görünüm modeli
   */
  invoke(params = {}) {
    const limit = Number(params.limit) || 3;
    const activities = userLogStore.getRecentUserLogs(limit);

    const viewModel = {
      title: params.title || 'Son Topluluk Paylaşımları',
      activities,
      hasActivities: activities.length > 0
    };

    return this.view('recentActivity', viewModel);
  }
}
