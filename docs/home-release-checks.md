# Ana sayfa — yerel yayın adayı

## Kapsam

- EJS içeriği, Express controller/model veri akışı korunur.
- Stüdyo → tanıtım → iki araç önizlemesi → bakım konuları → diğer rehberler → kapanış.
- Örnek içerik açıkça belirtilir; hesap, gerçek kullanıcı yorumu veya kişisel kayıt özelliği vaat edilmez.
- Otomatik araç dönüşü; manuel sürükleme/döndürme arayüzü yok.
- Kaynak ve CC BY 4.0 atfı `/Home/About` sayfasında; footer'dan erişilebilir.
- Başlık, description, Open Graph metinleri ve yerel SVG favicon.

## Animasyon ve dayanıklılık

- GSAP/Lenis yalnızca ana sayfada. Ortak menü modülü ayrı paketlenir.
- 900px genişlik / 650px yükseklik üzerinde sticky stüdyo; diğer ekranlarda normal akış.
- Reduced motion: sayfa timeline'ları devre dışı; araç dönüşü durur.
- JavaScript yoksa HTML içerik ve navigasyon görünür; araç için SVG yedeği vardır.
- Model yükleme hatası veya WebGL context kaybında SVG yedeği kullanılır.
- Model zaman aşımından sonra gelirse kaynakları serbest bırakılır.
- Görünmeyen sekmede/ekran dışında WebGL döngüsü durur. DPR en fazla 1.5.
- Bölüm linkiyle ilk açılışta fontlar ve ScrollTrigger ölçümleri sonrası konum düzeltilir.
- home.css önceki üst üste override kurallarından arındırılmıştır.

## Doğrulama

- 14 Node HTTP testi: mevcut sayfalar, filtreler, escaping, aktif menü, ana sayfa
  iç bağlantıları, bölüm hedefleri, metadata, model ve lisans bağlantıları.
- Yerel in-app tarayıcıda 1440px masaüstü: model, sabit sahne, içerik ve alt bölümler.
- 320px mobil: yatay taşma yok, tek canvas, pin kapalı; menü ve Escape çalışıyor.
- Klavyede ilk Tab: içeriğe geç. Enter: main-content odağı.
- Ana sayfa konsolunda kontrol sırasında hata/uyarı görülmedi.

## Dağıtım sınırı

Bu dosya tüm tarayıcılarda veya tüm gerçek cihazlarda kusursuzluk garantisi değildir.
Gerçek iOS/Android donanımında FPS/batarya ölçümü, işletim sistemi reduced-motion
ayarının canlı cihaz testi, WebGL kapalı tarayıcı testi ve gerçek hosting/domain
üzerinde son kontrol yapılmadı. Reduced-motion ve hata yolları kod düzeyinde incelendi.
Veriler eğitim örnekleridir; frontend'in tamamlanması bunları canlı hizmet verisine çevirmez.

Kurulum: `npm ci`, `npm start` (prestart frontend build üretir).
