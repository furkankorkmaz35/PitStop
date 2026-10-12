import Garage from '../models/garage.js';
import Guide from '../models/guide.js';
import MaintenanceLog from '../models/maintenanceLog.js';
import PartReview from '../models/partReview.js';
import Vehicle from '../models/vehicle.js';

export const vehicles = [
  new Vehicle("Toyota", "Corolla", "1.6 Valvematic", 2015, 132, "Benzin", "Multimedya ekranında donma; düzenli bakımda yağ tüketimini takip edin.", "Düşük"),
  new Vehicle("Volkswagen", "Golf", "1.6 TDI", 2014, 105, "Dizel", "EGR ve DPF tıkanması kısa mesafe kullanımında görülebilir.", "Orta"),
  new Vehicle("Fiat", "Egea", "1.3 Multijet", 2018, 95, "Dizel", "Debriyaj ve ön takım aşınması kullanım koşullarına bağlıdır.", "Orta"),
  new Vehicle("Honda", "Civic", "1.6 i-VTEC", 2016, 125, "Benzin", "Klima kompresörü ve süspansiyon sesleri kontrol edilmelidir.", "Düşük")
];

export const maintenanceLogs = [
  new MaintenanceLog("12.09.2026", "Toyota Corolla 1.6", "Periyodik bakım", "Yağ + filtre seti", 3850, "Özel servis"),
  new MaintenanceLog("08.06.2026", "VW Golf 1.6 TDI", "Fren bakımı", "Ön balata", 2700, "Usta önerisi"),
  new MaintenanceLog("21.04.2026", "Fiat Egea 1.3", "Akü değişimi", "60 Ah akü", 4200, "Yetkili servis")
];

export const guides = [
  new Guide("Motor yağı ve filtre değişimi", "Orta", "60–90 dk", "Doğru yağ standardını kontrol edin; kullanılmış yağı atık toplama noktasına verin."),
  new Guide("Hava filtresi kontrolü", "Kolay", "15 dk", "Filtreyi ışığa tutarak kirliliği inceleyin ve araç kitapçığındaki aralığı izleyin."),
  new Guide("Akü ve kutup başı kontrolü", "Kolay", "20 dk", "Kontrol öncesi kontağı kapatın; kutup başlarında oksitlenme olup olmadığına bakın.")
];

export const partReviews = [
  new PartReview("Yağ filtresi", "OEM", "Corolla 1.6", "Üretici standardında uyum", "Fiyatı daha yüksek", 4.7),
  new PartReview("Yağ filtresi", "Yan sanayi", "Corolla 1.6", "Uygun fiyat, yaygın bulunurluk", "Üretici ve seri bazında kalite değişir", 4.1),
  new PartReview("Ön fren balatası", "OEM", "Golf 1.6 TDI", "Öngörülebilir uyum", "Maliyet yüksek olabilir", 4.5)
];

export const garages = [
  new Garage("Usta Garaj", "İstanbul", "Dizel ve EGR", "Volkswagen · Fiat", 4.6),
  new Garage("Anadolu Oto Servis", "Ankara", "Periyodik bakım", "Toyota · Honda", 4.8),
  new Garage("Ege Motor", "İzmir", "Elektrik ve klima", "Tüm markalar", 4.4)
];
