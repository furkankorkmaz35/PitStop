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

- C# ve .NET 8
- ASP.NET Core MVC
- Razor Views (`.cshtml`)
- HTML ve CSS

## Mimari

Uygulama MVC düzenini kullanır. İstek ilgili Controller action’ına gelir; Controller örnek veriyi alıp Razor View’e gönderir. View, veriyi HTML olarak gösterir ve görünümü `wwwroot/css/site.css` dosyasındaki stiller belirler.

| Controller | Sayfalar | Sorumluluk |
| --- | --- | --- |
| `VehicleController` | `Catalog`, `Detail` | Araç arama, katalog ve araç bilgileri |
| `MaintenanceController` | `Logs`, `Guide` | Bakım kayıtları ve DIY içerikleri |
| `ReviewController` | `PartReviews`, `GarageFinder` | Parça karşılaştırması ve servis önerileri |

Örnek kayıtlar `Data/DemoData.cs` dosyasında tutulur. Model sınıfları `Models` klasöründedir. İlerleyen geliştirme aşamalarında örnek verilerin veritabanı ve uygulama servisleri üzerinden sağlanması planlanmaktadır.

## Gereksinimler

- .NET 8 SDK
- Visual Studio kullanılıyorsa **ASP.NET ve web geliştirme** iş yükü

## Çalıştırma

### Visual Studio ile

1. `PitStop.csproj` dosyasını Visual Studio’da açın.
2. NuGet paketlerinin geri yüklenmesini bekleyin.
3. Çalıştırma profili olarak `PitStop` seçiliyken **F5** tuşuna basın.

### Terminal ile

Proje klasöründe terminal açıp şu komutları çalıştırın:

```bash
dotnet restore
dotnet run
```

Uygulama başladığında terminalde verilen yerel adresi tarayıcıda açın. Ana sayfa araç kataloğudur.

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
├── Controllers/       # MVC Controller sınıfları
├── Data/              # Sunum için örnek veriler
├── Models/            # Araç, bakım, rehber, parça ve servis modelleri
├── Properties/        # Yerel çalıştırma ayarları
├── Views/             # Controller sayfaları ve ortak Razor layout
├── wwwroot/css/       # Responsive site stilleri
├── PitStop.csproj
└── Program.cs
```

## Veri hakkında

Bu sürümdeki araç, bakım, parça ve servis kayıtları örnek amaçlıdır; veritabanına kaydedilmez ve gerçek kullanıcı katkısı değildir. Projenin sonraki aşamalarında veritabanı, kullanıcı hesabı, kişisel garaj ve katkı doğrulama özellikleri eklenebilir.

## Ekip

- Furkan Korkmaz
- Ahmet Alperen Aydoğdu
- Oğuz Han Uyar
