/**
 * @file userLogStore.js
 * @description Kullanıcı Veri Deposu (In-Memory Repository)
 * 
 * Bu sınıf, kullanıcının site üzerindeki formlar (HtmlHelpers ile oluşturulan) aracılığıyla
 * doğrudan girdiği bakım, onarım ve deneyim kayıtlarını hafızada tutar ve yönetir.
 * 
 * Veri Akışı Prensibi:
 * 1. Kullanıcı "/Maintenance/Create" sayfasından formu doldurur.
 * 2. Sunucu veriyi doğrular ve bu depoya kaydeder (`addUserLog`).
 * 3. Kullanıcı doğrudan "/Maintenance/Logs" veya "/Vehicle/Detail" sayfasına yönlendirilir
 *    ve girdiği verileri anında bu sayfalarda görebilir.
 */

class UserLogStore {
  constructor() {
    // Başlangıç için örnek 1 adet kullanıcı katkısı (sistemdeki veri formatını göstermek için)
    this.logs = [
      {
        id: 101,
        date: '23.10.2026',
        vehicle: 'Renault Megane 1.5 dCi',
        operation: 'Triger Seti & Devirdaim Değişimi',
        part: 'Gates Triger Kayış Seti ve Orijinal Pompa',
        service: 'Özel Servis',
        cost: 6200,
        notes: '120.000 km ağır bakımı kapsamında yapıldı. Ses tamamen kesildi, motor çekişi gayet iyi.',
        author: 'Topluluk Üyesi (Ahmet)',
        createdAt: new Date('2026-10-23T14:30:00Z')
      }
    ];
    this.nextId = 102;
  }

  /**
   * Sistemdeki tüm kullanıcı kayıtlarını en yeniden en eskiye sıralı olarak döner.
   * @returns {Array} Kullanıcı bakım kayıtları dizisi
   */
  getAllUserLogs() {
    return [...this.logs];
  }

  /**
   * En son eklenen N adet kullanıcı kaydını döner (ViewComponent'ler için kullanılır).
   * @param {number} limit - Alınacak maksimum kayıt sayısı
   * @returns {Array}
   */
  getRecentUserLogs(limit = 3) {
    return [...this.logs].slice(0, limit);
  }

  /**
   * Belirtilen marka ve modele ait kullanıcı bakım kayıtlarını filtreler.
   * Araç detay sayfasında (/Vehicle/Detail) ilgili araca ait kullanıcı verilerini göstermek için kullanılır.
   * @param {string} brand - Araç markası
   * @param {string} model - Araç modeli
   * @returns {Array} Eşleşen kullanıcı kayıtları
   */
  getUserLogsByVehicle(brand = '', model = '') {
    const brandTerm = brand.trim().toLowerCase();
    const modelTerm = model.trim().toLowerCase();

    return this.logs.filter(log => {
      const v = log.vehicle.toLowerCase();
      // Hem marka hem model içeren veya en azından model adı geçen kayıtları eşleştir
      return (brandTerm && v.includes(brandTerm) && modelTerm && v.includes(modelTerm)) ||
             (modelTerm && v.includes(modelTerm));
    });
  }

  /**
   * Formdan (HtmlHelpers ile oluşturulan) gelen yeni bakım kaydını sisteme ekler.
   * @param {Object} param0 - Form verileri
   * @returns {Object} Yeni oluşturulan kayıt nesnesi
   */
  addUserLog({ vehicle, operation, part, service, cost, date, notes, author }) {
    const now = new Date();
    // Tarih girilmemişse bugünün tarihini GG.AA.YYYY formatında oluştur
    const formattedDate = date && date.trim() 
      ? date.trim() 
      : `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    const newLog = {
      id: this.nextId++,
      date: formattedDate,
      vehicle: (vehicle || '').trim(),
      operation: (operation || '').trim(),
      part: (part || '').trim(),
      service: (service || 'Özel Servis').trim(),
      cost: Number(cost) || 0,
      notes: (notes || '').trim() || 'Kullanıcı tarafından ek açıklama belirtilmedi.',
      author: (author || 'Ziyaretçi Sürücü').trim(),
      createdAt: now
    };

    // Yeni kaydı listenin başına ekle (en üstte görünmesi için)
    this.logs.unshift(newLog);
    return newLog;
  }
}

// Tüm uygulama genelinde tekil (singleton) veri deposu örneği
export const userLogStore = new UserLogStore();
