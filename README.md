# PitStop

PitStop, otomobil modeli ve motor tipine göre bakım bilgilerini, kronik sorunları, parça deneyimlerini ve servis önerilerini bir araya getiren bir rehber projesidir.

## Çalıştırma

.NET 8 SDK kurulu olmalıdır. Proje klasöründe terminal açıp şu komutu çalıştırın:

```bash
dotnet run
```

Uygulama açıldığında araç kataloğu ana sayfa olarak görüntülenir.

## İlk sürümdeki sayfalar

- `VehicleController`: araç kataloğu ve araç detayları
- `MaintenanceController`: bakım kayıtları ve DIY bakım rehberleri
- `ReviewController`: parça incelemeleri ve servis bulma

Sayfalar Razor ile hazırlanmıştır. Örnek veriler `Data/DemoData.cs` içinde tutulur; responsive tasarım `wwwroot/css/site.css` dosyasındadır.

> Bu sürüm sunum için örnek veriler kullanır. Veritabanı bağlantısı ve gerçek kullanıcı katkıları sonraki geliştirme adımlarında eklenecektir.
