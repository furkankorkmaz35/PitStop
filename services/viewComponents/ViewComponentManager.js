/**
 * @file ViewComponentManager.js
 * @description ViewComponent Yöneticisi ve Yürütücüsü (Component Invoker)
 * 
 * Bu sınıf, sistemdeki tüm ViewComponent'leri kaydeder ve EJS görünümlerinde
 * `<%- Component.Invoke('QuickStats', { ... }) %>` şeklinde çağrılmasını sağlar.
 * 
 * ASP.NET Core MVC Karşılığı: `@await Component.InvokeAsync("ComponentName", new { ... })`
 */

import fs from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';

const templateCache = new Map();

export class ViewComponentManager {
  /**
   * @param {string} viewsDir - Views klasör yolu
   * @param {Object} resLocals - İstek düzeyindeki Express yerel değişkenleri
   */
  constructor(viewsDir, resLocals = {}) {
    this.viewsDir = viewsDir;
    this.resLocals = resLocals;
    this.components = new Map();
  }

  /**
   * Sisteme yeni bir ViewComponent örneği kaydeder.
   * @param {ViewComponent} componentInstance 
   */
  register(componentInstance) {
    this.components.set(componentInstance.name, componentInstance);
  }

  /**
   * EJS şablonlarında bir ViewComponent'i çağırmak için kullanılan metot.
   * 
   * @param {string} componentName - Çağrılacak bileşenin adı (örn: 'QuickStats')
   * @param {Object} params - Bileşene aktarılacak parametreler
   * @returns {string} Render edilmiş HTML çıktısı
   */
  Invoke(componentName, params = {}) {
    const comp = this.components.get(componentName);
    if (!comp) {
      throw new Error(`[ViewComponentManager] '${componentName}' adında kayıtlı bir ViewComponent bulunamadı.`);
    }

    // 1. ViewComponent'in kendi bağımsız veri alma ve iş mantığını çalıştır
    const result = comp.invoke(params);

    // 2. İlgili component görünüm dosyasını bul (views/components/viewComponents/<viewName>.ejs)
    const viewFileName = `${result.viewName}.ejs`;
    const fullPath = path.join(this.viewsDir, 'components', 'viewComponents', viewFileName);

    let templateStr = templateCache.get(fullPath);
    if (!templateStr) {
      if (!fs.existsSync(fullPath)) {
        throw new Error(`[ViewComponentManager] Component görünümü bulunamadı: ${fullPath}`);
      }
      templateStr = fs.readFileSync(fullPath, 'utf8');
      templateCache.set(fullPath, templateStr);
    }

    // 3. Veriyi bileşen şablonuyla senkron olarak render et
    const renderContext = {
      ...this.resLocals,
      ...result.data,
      Component: this
    };

    return ejs.render(templateStr, renderContext, {
      filename: fullPath,
      views: [this.viewsDir]
    });
  }
}
