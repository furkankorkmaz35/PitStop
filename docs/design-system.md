# PitStop tasarım sistemi

İlk aşama: mevcut sayfa içerikleri ve MVC akışı korunarak temel elemanlar oluşturuldu.
Font Poppins; tema koyu antrasit, kırık beyaz ve turuncu. Three.js ve yeni sayfa
kompozisyonları sonraki aşamadır.

## Katmanlar

- `public/css/tokens.css`: ortak renk, font, boşluk, köşe ve hareket değerleri.
- `public/css/base.css`: HTML temeli, klavye odağı, erişilebilirlik yardımcıları.
- `public/css/components.css`: buton, alan, rozet, kart, tablo, liste ve teknik bilgiler.
- `public/css/layout.css`: menü, footer ve mevcut sayfaların responsive yerleşimi.
- `public/css/site.css`: katmanların tek giriş noktası.
- `views/components/`: veri gösteren EJS parçaları; veri sorgulamaz, controller çağırmaz.
- `views/partials/`: ortak belge kabuğu (header/footer).

Controller veriyi hazırlayıp sayfa view'ına gönderir. Sayfa view'ı küçük EJS
bileşenlerini include eder. Yeni frontend elemanı eklemek için route veya model
değişikliği gerekmez. Renkleri sayfa bazında kopyalamak yerine token kullanın.

## Kullanım

```ejs
<%- include('../components/button', {
  label: 'Filtrele', buttonType: 'submit'
}) %>

<%- include('../components/button', {
  label: 'Temizle', variant: 'secondary', disabled: true
}) %>

<%- include('../components/field', {
  id: 'brand', name: 'brand', label: 'Marka',
  placeholder: 'Marka ara', value: ''
}) %>

<%- include('../components/badge', {
  label: 'Örnek', tone: 'accent'
}) %>

<%- include('../components/card', {
  eyebrow: 'BAKIM', heading: 'Bakım kayıtları',
  description: 'Aracının bakım geçmişini incele.'
}) %>
```

Buton tipi varsayılan olarak `button`, varyant `primary` olur. Buton davranışları
kullanan sayfa tarafından belirlenir. Rozet tonları: nötr (tone yok), accent,
success, warning. Kart başlığı h3'tür; h2 ile başlayan bölümlerde kullanılır.
Tüm kullanıcıya görünen metinler `<%=` ile escape edilir; `<%-` yalnızca kendi
şablonlarımızın include çıktısı için kullanılır.

Tablolar semantik HTML olarak view'da kalır; `.table-wrap` kapsayıcısı ortak
stili ve yatay kaydırmayı sağlar. Kapsayıcıya `role="region"`, anlamlı bir
`aria-label` ve `tabindex="0"` verilir. Bu sayede tablo klavyeyle kaydırılabilir.

## Görsel kurallar

- Zemin #111315, yüzey #1D2125, metin #F4F4F0, vurgu #FF6B35.
- Poppins: 400 metin, 500 etiket, 600 başlık/buton, 700 marka.
- Fontlar Latin ve Latin Extended alt kümeleriyle yerel sunulur; Türkçe
  karakterler desteklenir. Kaynak `@fontsource/poppins`, lisans
  `public/fonts/Poppins-LICENSE.txt`. Çalışırken harici font servisi kullanılmaz.
- Boşluklar tokens.css içindeki 4/8/12/16/24/32/48/64px ölçeğine dayanır.
- Form alanları ve butonlar en az 48px yüksekliğindedir.
- Hover, focus-visible ve disabled durumları ortak tanımlanır.
- 780px altında filtreler ve iki sütunlu düzen tek sütuna geçer.
- Hareket azaltma tercihi temel CSS'te desteklenir; Three.js eklenirken de korunmalıdır.

Bu aşamada backend, route'lar, modeller ve örnek veriler değiştirilmedi.

## İkinci aşama: ana sayfa

`HomeController` ve `homeRoutes` eklendi. `/`, `/Home`, `/Home/Index` tanıtım
sayfasını, `/Home/About` proje kapsamını gösterir. Araç kataloğu
`/Vehicle/Catalog` adresinde kalır. Böylece dört controller'ın her biri iki
view sunar. Mevcut araç/bakım/inceleme controller'ları ve modeller korunur.

Ana sayfa yerleşimi `home.css` dosyasındadır. `linkButton` ve `featureCard`
EJS parçaları eklenmiştir; href değerleri uygulamanın kendi sabit yollarından
verilir. Araç çizimi yerel SVG'dir, henüz Three.js veya animasyon içermez.

## Üçüncü aşama: Three.js araç sahnesi

Statik araç alanı `views/components/carStage.ejs` bileşenine taşındı.
`frontend/home.js`, sahne ekrana yaklaşınca `frontend/car-scene.js` modülünü
indirir. Three.js yalnızca ana sayfada kullanılır; diğer MVC sayfaları ek
JavaScript yüklemez. `scripts/build-frontend.js` esbuild ile modülleri paketler
ve yerel Draco çözücüsünü kopyalar.

Sahne: yavaş dönüş, durdur/başlat, klavyeyle de kullanılabilen açı düğmeleri,
responsive kamera ve en fazla 1.5 piksel oranı. Ekran dışında/gizli sekmede
render döngüsü durur. Reduced motion başlangıçta otomatik dönüşü kapatır.
Model hatası veya WebGL context kaybında SVG görünümü korunur.
Model kaynak ve lisansı `public/models/ATTRIBUTION.md` içindedir.

Doğrulama: 9 HTTP testi, masaüstü WebGL model yükleme, durdurma/açı değiştirme,
390px mobilde tek canvas ve taşmasız görünüm. Gerçek cihaz performansı ve
WebGL kapalı cihaz testi henüz yapılmadı.

## Dördüncü aşama: araç kataloğu

Katalog tablosu `views/components/vehicleCard.ejs` kartlarına dönüştürüldü.
Yerleşim `public/css/catalog.css` içinde; masaüstünde iki, mobilde tek sütun.
Model bilgileri ve detay bağlantıları korunur. Araç fotoğrafı varmış gibi
başka modellere ait görseller kullanılmaz.

VehicleController filtreleme sorumluluğunu korur; view'a mevcut arama
metinlerini `filters` ve aktif filtre durumunu `hasFilters` olarak gönderir.
Form değerleri, filtre özeti, temizleme bağlantısı ve boş sonuç görünümü EJS
ile oluşturulur. Katalog JavaScript gerektirmez.

Doğrulama: 10 test, gerçek tarayıcıda Toyota araması/temizleme ve 390px mobil
kart yerleşimi. Ana sayfa ile diğer controller'ların davranışı korunmuştur.

## Beşinci aşama: araç detayı

Detay view'ı katalogla aynı görsel dile taşındı: sayfa yolu, teknik bilgi
paneli, örnek model notu ve ortak featureCard bileşenleriyle rehber bağlantıları.
Controller, model ve route davranışı değiştirilmedi. Örnek notlar gerçek
kullanıcı katkısı gibi sunulmaz; genel rehber bağlantıları modele özelmiş gibi
etiketlenmez. Yerleşim `public/css/vehicle-detail.css` içindedir.

Doğrulama: 11 test; seçilen dört aracın detay eşleşmesi, Volkswagen teknik
bilgileri, masaüstü görünüm ve 390px mobilde taşmasız yerleşim.

## Altıncı aşama: bakım bölümü

Bakım kayıtları ve rehber sayfaları ortak tema ile yenilendi. `statCard` bileşeni
controller'dan gelen toplamı ve kayıt sayısını gösterir. İşlem ve parça aynı
hücrede sunulur; tablo klavyeyle yatay kaydırılabilir. Rehber kartları mevcut
özet, zorluk ve süre verilerini gösterir; detay sayfası varmış gibi davranmaz.
Örnek veri kapsamı ve kayıt düzenleme özelliğinin bulunmadığı açıkça belirtilir.
Sayfa yerleşimleri `maintenance.css` içindedir. Controller, model, route ve
örnek veriler değişmedi; mobilde kartlar tek sütuna geçer.

## Yedinci aşama: parça inceleme ve servis rehberi

`partReviewCard` ve `garageCard` bileşenleri mevcut model verilerini sunar.
Örnek puanlar gerçek kullanıcı değerlendirmesi olarak etiketlenmez. Sayfa
stilleri `review.css` içindedir; kartlar mobilde tek sütuna iner.
Servis GET aramasında şehir değeri korunur, filtre temizleme ve boş sonuç
bağlantıları bulunur. Türkçe büyük/küçük harf eşleştirmesi ve baş/son boşlukların
temizlenmesi ReviewController'da yapılır. Model ve route yapıları korunur.

## Ana sayfa sanat yönü revizyonu

Tekrarlayan kart/CTA blokları yerini dört satırlı keşif dizinine bıraktı.
Açık stüdyo sahnesi, daha sakin tipografi ve ekran içine girerken tek seferlik
geçişler kullanılır. Model başlangıçta sabittir; sürükleme ve ok düğmeleri
hedef açıya yumuşak geçer. Otomatik dönüş kullanıcı tarafından açılır.
Reduced motion geçişleri kaldırır. MVC verileri ve route'lar değişmedi.

## Sabit sahne ve otomatik dönüş

Manuel sürükleme ve açı düğmeleri kaldırıldı. Araç görünürken otomatik döner;
gizli sekmede/ekran dışında döngü durur. Hareket azaltma tercihinde sabittir.
900px genişlik ve 650px yükseklik üzerindeki ekranlarda, hareket azaltma kapalıysa
ana sahne 260vh anlatı boyunca CSS sticky ile sabitlenir. Doğal scroll ilerlemesi
metin geçişlerini, hafif sahne büyümesini ve ilerleme çizgisini yönetir.
Scroll engellenmez; GSAP bağımlılığı eklenmeden aynı pin/scrub yaklaşımı kullanılır.
Mobilde ve JavaScript olmadan normal sayfa akışı korunur.

## GSAP / Lenis stüdyo akışı

`frontend/motion/home-motion.js` sunum katmanındaki animasyonları yönetir.
GSAP matchMedia, masaüstü ve reduced-motion durumlarına göre timeline'ları
kurar/temizler. Lenis yalnızca uygun masaüstü görünümünde GSAP ticker'a bağlanır.
Başlık satırları maskeden açılır; sticky sahnede metin, kamera yaklaşımı ve
ışık aynı ilerleme değerini kullanır. Araç bağımsız yavaş otomatik dönüşünü sürdürür.
Son aşamada beş şerit açık renkli bilgi bölümüne geçişi hazırlar.
Parlak platform kaldırıldı; araç gerçek zamanlı gölge alan bir zemine oturur.
Sahne kodu `setProgress` arayüzü sunar; controller/model/route katmanları değişmedi.

## Ortak gezinme

`frontend/site.js` tüm sayfalarda küçük bir menü modülü yükler; GSAP/Three.js
ortak pakete dahil değildir. Mobil menü bir disclosure bileşenidir: aria-expanded,
Escape ile kapatma, odak dışarı çıktığında kapatma ve sayfaya geri dönüşte sıfırlama.
JavaScript olmadığında bağlantılar görünür kalır. Aktif yol sunucuda res.locals
üzerinden header'a iletilir; araç detayında katalog bağlamı işaretlenir.
Destekleyen tarayıcılarda CSS cross-document view transition 160–240ms sürer;
reduced motion tercihinde etkinleşmez. Navigation yönlendirmesi ele geçirilmez.
Kaynak: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40view-transition
Doğrulama: 13 HTTP testi; 390px menü aç/kapat, Escape, katalog gezinmesi,
aktif sayfa eşleşmesi ve yatay taşma kontrolü.

## Ana sayfa içerik ve alt bölüm ritmi

Tanıtım tek cümleye, keşif satırlarının açıklamaları kısa konu etiketlerine
indirildi. Açılışla aynı maskeli satır animasyonu tanıtım başlığında kullanılır.
Tanıtımın çizgileri ve keşif satırları ScrollTrigger ile bir kez açılır;
bağlantı zeminleri hover ve klavye odağında aynı hareketi paylaşır.
Reduced-motion durumunda tüm içerik doğrudan görünür. Dört keşif bağlantısı,
örnek veri açıklaması ve MVC akışı korunur.

## Ana sayfa yayın adayı temizliği

home.css tek bir bileşen düzenine toplandı. Mobil animasyon eşleşmesi, hash
başlangıç konumu ve sahne kaynak temizliği düzeltildi. İçerik akışı ve bölüm
numaraları sadeleştirildi; kapanış ve başa dönüş eklendi. Son kontrol kapsamı
ve gerçek cihaz/hosting sınırları `docs/home-release-checks.md` dosyasındadır.
