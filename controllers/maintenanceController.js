/**
 * @file maintenanceController.js
 * @description Bakım ve Servis İşlemleri Controller'ı (MVC Mimarisi)
 * 
 * Sorumluluklar:
 * 1. logs: Bakım kayıtları sayfasını (/Maintenance/Logs) sunar. Sistem kayıtlarını ve
 *    kullanıcıların doğrudan girdiği canlı kayıtları (userLogStore) bir araya getirir.
 * 2. createLogPage (GET): Kullanıcının yeni veri gireceği formu sunar (/Maintenance/Create).
 *    Form elemanları View katmanında HtmlHelpers ile üretilir.
 * 3. createLogSubmit (POST): Formdan gönderilen verileri doğrular, UserLogStore'a ekler
 *    ve kullanıcıyı bu verileri doğrudan görebileceği /Maintenance/Logs sayfasına yönlendirir.
 * 4. guide: DIY bakım rehberlerini listeler.
 * 5. downloadLogPdf: İlgili bakım kaydı için resmi formatta PDF servis dökümü üretir.
 */

import { maintenanceLogs, guides } from '../data/demoData.js';
import { userLogStore } from '../data/userLogStore.js';
import { generateMaintenancePdf } from '../services/pdfService.js';

// Formda HtmlHelper DropDownList ile kullanılacak standart seçenekler
const OPERATION_OPTIONS = [
  'Periyodik Bakım',
  'Ön / Arka Fren Balata & Disk Değişimi',
  'Triger Kayış & Devirdaim Seti',
  'Motor Yağı ve Filtre Değişimi',
  'Akü Değişimi & Şarj Kontrolü',
  'Alt Takım, Rot-Balans ve Süspansiyon',
  'Klima Gazı & Polen Filtresi Dezenfeksiyonu',
  'Şanzıman Yağı & Debriyaj Baskı Balata',
  'Soğutma Sistemi & Antifriz Yenileme',
  'Genel Kontrol & Diğer Onarımlar'
];

const SERVICE_OPTIONS = [
  'Özel Servis',
  'Yetkili Servis',
  'Bağımsız Usta',
  'Kendim Yaptım (DIY Garaj)',
  'Lastik & Rot-Balans Servisi'
];

/**
 * Bakım kayıtları listeleme sayfası (Görüntüleme Sayfası - Page B).
 * Kullanıcının başka bir sayfada (/Maintenance/Create) girdiği veriler
 * doğrudan burada listelenir.
 */
export function logs(req, res) {
  // Örnek sistem kayıtlarının toplam maliyeti (Mevcut testlerin bozulmaması için korunur: ₺23.900)
  const totalCost = maintenanceLogs.reduce((total, log) => total + log.cost, 0);

  // Kullanıcıların site üzerinden form ile girdiği canlı kayıtlar
  const userLogs = userLogStore.getAllUserLogs();

  // Yeni bir kayıt eklenip bu sayfaya yönlenildi mi?
  const success = req.query.success === '1';
  const addedVehicle = req.query.vehicle || '';

  res.render('maintenance/logs', {
    title: 'Bakım Kayıtları',
    logs: maintenanceLogs,
    totalCost,
    userLogs,
    success,
    addedVehicle
  });
}

/**
 * Yeni bakım kaydı ekleme formu (Veri Giriş Sayfası - Page A).
 * Sayfadaki form elemanları HtmlHelpers ile oluşturulacaktır.
 */
export function createLogPage(req, res) {
  // URL parametresinden varsa araç adını varsayılan olarak forma taşı (örn: /Maintenance/Create?vehicle=Golf)
  const defaultVehicle = typeof req.query.vehicle === 'string' ? req.query.vehicle.trim() : '';

  res.render('maintenance/create', {
    title: 'Yeni Bakım Kaydı Ekle',
    errors: {},
    model: {
      vehicle: defaultVehicle,
      operation: OPERATION_OPTIONS[0],
      part: '',
      service: SERVICE_OPTIONS[0],
      cost: '',
      date: '',
      notes: ''
    },
    operationOptions: OPERATION_OPTIONS,
    serviceOptions: SERVICE_OPTIONS
  });
}

/**
 * Yeni bakım kaydını işleme ve kaydetme (POST).
 * Formdan gelen veriler doğrulanır, veri deposuna kaydedilir ve kullanıcı
 * girdiği verileri doğrudan görebileceği /Maintenance/Logs sayfasına yönlendirilir.
 */
export function createLogSubmit(req, res) {
  const { vehicle, operation, part, service, cost, date, notes } = req.body;
  const errors = {};

  // Form doğrulama kuralları
  if (!vehicle || vehicle.trim().length < 2) {
    errors.vehicle = 'Lütfen geçerli bir araç marka ve modeli giriniz (Örn: Volkswagen Golf 1.6 TDI).';
  }
  if (!operation || operation.trim().length < 2) {
    errors.operation = 'Lütfen yapılan bakım veya işlem türünü seçiniz.';
  }
  if (!part || part.trim().length < 2) {
    errors.part = 'Lütfen kullanılan parça veya malzeme bilgisini belirtiniz.';
  }
  const numericCost = Number(cost);
  if (isNaN(numericCost) || numericCost <= 0) {
    errors.cost = 'Lütfen 0\'dan büyük geçerli bir bakım maliyeti (₺) giriniz.';
  }

  // Hata varsa formu girilen veriler ve hata mesajları ile tekrar render et
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('maintenance/create', {
      title: 'Yeni Bakım Kaydı Ekle',
      errors,
      model: { vehicle, operation, part, service, cost, date, notes },
      operationOptions: OPERATION_OPTIONS,
      serviceOptions: SERVICE_OPTIONS
    });
  }

  // Aktif kullanıcı adı veya anonim sürücü
  const authorName = res.locals.currentUser ? res.locals.currentUser.name : 'Ziyaretçi Sürücü';

  // Veriyi doğrudan sistemin veri deposuna kaydet
  const savedLog = userLogStore.addUserLog({
    vehicle,
    operation,
    part,
    service,
    cost: numericCost,
    date,
    notes,
    author: authorName
  });

  // Kullanıcıyı girdiği verileri doğrudan görebileceği Bakım Kayıtları sayfasına yönlendir
  return res.redirect(`/Maintenance/Logs?success=1&vehicle=${encodeURIComponent(savedLog.vehicle)}#user-logs-section`);
}

/**
 * DIY Bakım rehberlerini listeler.
 */
export function guide(req, res) {
  res.render('maintenance/guide', { title: 'DIY Rehber', guides });
}

/**
 * Bakım kaydı için resmi PDF servis raporu indirir.
 */
export function downloadLogPdf(req, res) {
  const id = parseInt(req.params.id, 10);
  const log = maintenanceLogs.find(l => l.id === id);

  if (!log) {
    return res.status(404).redirect('/Maintenance/Logs');
  }

  const safeVehicle = log.vehicle.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PitStop-Bakim-Kaydi-${log.id}-${safeVehicle}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  generateMaintenancePdf(log, res);
}
