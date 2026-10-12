# PitStop

PitStop, otomobil sahiplerinin bakım ve parça deneyimlerini araç modeli ve motor tipine göre bir araya getiren bir rehber platformudur. Proje, klasik bir araç ilan sitesi yerine kronik sorunları, bakım geçmişini, parça uyumluluğunu ve servis deneyimini paylaşmaya odaklanır.

## Projenin amacı

Araç sahiplerinin ve ikinci el araç almayı düşünenlerin ihtiyaç duyduğu bilgileri tek yerde sunmak amaçlanır. Kullanıcı; bir aracı incelerken bilinen sorunları görebilir, bakım maliyetlerini karşılaştırabilir, parça seçeneklerini değerlendirebilir ve şehir/marka bilgisine göre servis önerilerine ulaşabilir.

## Mevcut özellikler

- **Araç kataloğu:** Marka ve motor tipine göre arama yapılabilir. Araçlar kronik sorun notlarıyla listelenir.
- **Araç detayı:** Seçilen aracın model yılı, motoru, yakıt türü, gücü ve kullanıcı notu gösterilir.
- **Bakım kayıtları:** Örnek bakım işlemleri, parça bilgileri ve maliyetleri tablo hâlinde görüntülenir. Toplam maliyet sayfa içinde hesaplanır.
- **DIY rehberi:** Temel bakım konuları zorluk seviyesi ve tahmini süreyle listelenir.
- **Parça incelemeleri:** Orijinal ve yan sanayi seçenekleri artı/eksi notları ve puanlarıyla karşılaştırılır.
- **Servis bulma:** Şehir bilgisine göre örnek servis önerileri filtrelenebilir.
- **Responsive arayüz:** Sayfalar masaüstü ve dar ekranlara uyum sağlayacak CSS kurallarıyla tasarlanmıştır.

## Kullanılan teknolojiler

- Node.js 22 veya üzeri
- Express 5
- EJS Views (`.ejs`)
- HTML ve CSS

## Mimari

Uygulama MVC düzenini kullanır. İstek ilgili Express router üzerinden Controller fonksiyonuna gelir; Controller örnek veriyi alıp EJS View’e gönderir. View, veriyi HTML olarak gösterir ve görünümü `public/css/site.css` dosyasındaki stiller belirler.

| Controller | Sayfalar | Sorumluluk |
| --- | --- | --- |
| `vehicleController.js` | `Catalog`, `Detail` | Araç arama, katalog ve araç bilgileri |
| `maintenanceController.js` | `Logs`, `Guide` | Bakım kayıtları ve DIY içerikleri |
| `reviewController.js` | `PartReviews`, `GarageFinder` | Parça karşılaştırması ve servis önerileri |

Örnek kayıtlar `data/demoData.js` dosyasında tutulur. Model sınıfları `models` klasöründedir. İlerleyen geliştirme aşamalarında örnek verilerin veritabanı ve uygulama servisleri üzerinden sağlanması planlanmaktadır.

## Gereksinimler

- Node.js 22 veya üzeri ve npm

## Çalıştırma

Proje klasöründe:

```bash
npm ci
npm start
```

Tarayıcıda http://localhost:3000 adresini açın. Ana sayfa araç kataloğudur.
İsteğe bağlı olarak `PORT` ortam değişkeniyle port değiştirilebilir.

Geliştirme sırasında dosya değişikliklerinde sunucuyu yeniden başlatmak için:

```bash
npm run dev
```

Sayfa ve filtre kontrollerini çalıştırmak için:

```bash
npm test
```

## Sayfa adresleri

- `/Vehicle/Catalog` — araç kataloğu
- `/Vehicle/Detail` — araç detayı
- `/Maintenance/Logs` — bakım kayıtları
- `/Maintenance/Guide` — DIY bakım rehberi
- `/Review/PartReviews` — parça incelemeleri
- `/Review/GarageFinder` — servis bulma

Katalogda marka ve motor alanları; servis bulma sayfasında şehir alanı filtreleme için kullanılabilir.

## Klasör yapısı

```text
PitStop/
├── controllers/      # Araç, bakım ve inceleme controller fonksiyonları
├── data/             # Sunum için örnek veriler
├── models/           # Araç, bakım, rehber, parça ve servis modelleri
├── routes/           # URL ve controller eşleştirmeleri
├── views/            # EJS sayfaları ve ortak header/footer parçaları
├── public/css/       # Responsive site stilleri
├── test/             # Sayfa ve filtre kontrolleri
├── app.js            # Express uygulaması
├── server.js         # HTTP sunucusu
└── package.json
```

## Veri hakkında

Bu sürümdeki araç, bakım, parça ve servis kayıtları örnek amaçlıdır; veritabanına kaydedilmez ve gerçek kullanıcı katkısı değildir. Projenin sonraki aşamalarında veritabanı, kullanıcı hesabı, kişisel garaj ve katkı doğrulama özellikleri eklenebilir.

## Ekip

- Furkan Korkmaz
- Ahmet Alperen Aydoğdu
- Oğuz Han Uyar
