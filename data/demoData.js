import Garage from '../models/garage.js';
import Guide from '../models/guide.js';
import MaintenanceLog from '../models/maintenanceLog.js';
import PartReview from '../models/partReview.js';
import Vehicle from '../models/vehicle.js';

// Örnek araç kayıtlarıdır; kronik sorun notları kesin arıza teşhisi değildir.
export const vehicles = [
  new Vehicle("Toyota", "Corolla", "1.6 Valvematic", 2015, 132, "Benzin", "Multimedya ekranında donma; düzenli bakımda yağ tüketimini takip edin.", "Düşük"),
  new Vehicle("Volkswagen", "Golf", "1.6 TDI", 2014, 105, "Dizel", "EGR ve DPF tıkanması kısa mesafe kullanımında görülebilir.", "Orta"),
  new Vehicle("Fiat", "Egea", "1.3 Multijet", 2018, 95, "Dizel", "Debriyaj ve ön takım aşınması kullanım koşullarına bağlıdır.", "Orta"),
  new Vehicle("Honda", "Civic", "1.6 i-VTEC", 2016, 125, "Benzin", "Klima kompresörü ve süspansiyon sesleri kontrol edilmelidir.", "Düşük"),
  new Vehicle("Renault", "Clio", "1.0 TCe", 2021, 90, "Benzin", "Bakım geçmişini ve turbo çevresindeki yağ/ses belirtilerini inceleyin.", "Düşük"),
  new Vehicle("Renault", "Megane", "1.5 dCi", 2017, 110, "Dizel", "Enjektör, EGR ve partikül filtresi durumu kullanım geçmişiyle birlikte değerlendirilmelidir.", "Orta"),
  new Vehicle("Ford", "Focus", "1.5 TDCi", 2016, 120, "Dizel", "Debriyaj-volan ve emisyon sistemi kısa mesafe kullanımında kontrol edilmeli.", "Orta"),
  new Vehicle("Opel", "Astra", "1.4 Turbo", 2017, 150, "Benzin", "Soğutma sistemi ve turbo hortumlarında kaçak belirtisi aranmalı.", "Orta"),
  new Vehicle("Peugeot", "308", "1.5 BlueHDi", 2020, 130, "Dizel", "AdBlue/emisyon uyarıları ve servis kampanyaları şasi numarasıyla doğrulanmalı.", "Orta"),
  new Vehicle("Hyundai", "i20", "1.4 MPI", 2019, 100, "Benzin", "Debriyaj kavrama noktası ve ön takım sesleri test sürüşünde dinlenmeli.", "Düşük"),
  new Vehicle("Dacia", "Duster", "1.5 dCi 4x2", 2018, 110, "Dizel", "Aktarma, süspansiyon ve dizel emisyon sistemi kullanım koşullarına göre incelenmeli.", "Orta"),
  new Vehicle("BMW", "3 Serisi", "320i 2.0", 2015, 184, "Benzin", "Soğutma sistemi, yağ kaçakları ve otomatik şanzıman bakım kayıtları önemlidir.", "Orta"),
  new Vehicle("Nissan", "Qashqai", "1.5 dCi", 2017, 110, "Dizel", "DPF/EGR ve debriyaj durumu servis geçmişi ve kullanım profiliyle değerlendirilmelidir.", "Orta"),
  new Vehicle("Skoda", "Octavia", "1.6 TDI", 2016, 110, "Dizel", "EGR/DPF, DSG bakım geçmişi ve soğuk çalışma davranışı kontrol edilmeli.", "Orta")
];

export const maintenanceLogs = [
  new MaintenanceLog("12.09.2026", "Toyota Corolla 1.6", "Periyodik bakım", "5W-30 yağ, yağ ve hava filtresi", 3850, "Özel servis"),
  new MaintenanceLog("08.09.2026", "Volkswagen Golf 1.6 TDI", "Ön fren bakımı", "Ön balata seti ve işçilik", 2700, "Usta önerisi"),
  new MaintenanceLog("21.08.2026", "Fiat Egea 1.3 Multijet", "Akü değişimi", "60 Ah EFB akü ve kutup başı kontrolü", 4200, "Yetkili servis"),
  new MaintenanceLog("04.08.2026", "Honda Civic 1.6 i-VTEC", "Klima kontrolü", "Polen filtresi ve klima dezenfeksiyonu", 1450, "Özel servis"),
  new MaintenanceLog("19.07.2026", "Renault Clio 1.0 TCe", "Periyodik bakım", "Motor yağı, yağ filtresi ve genel kontrol", 3100, "Özel servis"),
  new MaintenanceLog("02.07.2026", "Ford Focus 1.5 TDCi", "Ön takım kontrolü", "Salıncak burcu ve rot ayarı", 3650, "Bağımsız servis"),
  new MaintenanceLog("14.06.2026", "Opel Astra 1.4 Turbo", "Soğutma sistemi", "Antifriz yenileme ve kaçak kontrolü", 2200, "Özel servis"),
  new MaintenanceLog("30.05.2026", "Hyundai i20 1.4 MPI", "Lastik ve fren kontrolü", "Balans, rotasyon ve fren ölçümü", 900, "Lastik servisi"),
  new MaintenanceLog("16.05.2026", "Renault Megane 1.5 dCi", "Yakıt filtresi değişimi", "Dizel yakıt filtresi ve hava alma", 1850, "Bağımsız servis")
];

export const guides = [
  new Guide("Motor yağı seviyesini ve yağ tipini kontrol et", "Kolay", "10–15 dk", "Aracı düz zeminde ve motor durduktan sonra kontrol edin. Yağ standardını kullanım kılavuzundan doğrulayın.", ["Aracı düz zemine alın ve motoru kapatıp birkaç dakika bekleyin.", "Yağ çubuğunu çıkarıp temizleyin; yerine takıp yeniden ölçün.", "Seviyeyi MIN–MAX aralığında doğrulayın; uygun yağ dışında ekleme yapmayın."], "Motor sıcakken parçalara dokunmayın. Doğru yağ standardından emin değilseniz servis kitapçığına bakın."),
  new Guide("Hava filtresini gözle kontrol et", "Kolay", "15–20 dk", "Kirli filtre hava akışını etkileyebilir. Değişim aralığını araç kitapçığına göre belirleyin.", ["Motorun kapalı ve soğuk olduğundan emin olun.", "Filtre kutusunu açmadan önce konumunu ve bağlantılarını inceleyin.", "Filtreyi hasar vermeden çıkarıp kir ve yırtık kontrolü yapın; doğru kodla değiştirin."], "Filtre kutusuna yabancı madde kaçırmayın. Emin değilseniz kapağı zorlamayın."),
  new Guide("Akü kutup başlarını güvenle incele", "Kolay", "10–20 dk", "Gevşeklik ve oksitlenme başlangıç sorunlarının işareti olabilir; akü üzerinde işlem dikkat gerektirir.", ["Kontağı kapatın, anahtarı araçtan uzaklaştırın ve koruyucu gözlük takın.", "Kutup başlarında çatlak, şişme veya yoğun oksitlenme olup olmadığını gözle kontrol edin.", "Akü sabitlemesini ve bağlantıların gevşek olup olmadığını kontrol edin."], "Akü kutuplarını kısa devre ettirmeyin. Sökme/temizleme ve start-stop akü işlemlerini uzmana bırakın."),
  new Guide("Lastik basıncını ve diş derinliğini ölç", "Kolay", "15 dk", "Doğru basınç araç etiketinde belirtilir; ölçümü lastikler soğukken yapın.", ["Kapı içi veya yakıt kapağındaki üretici basınç değerini bulun.", "Basıncı soğuk lastikte ölçüp araç yüküne uygun değere getirin.", "Dişlerde düzensiz aşınma, çatlak ve yabancı cisim kontrolü yapın."], "Basınç sensörü uyarısını tek başına arıza kanıtı saymayın; lastik hasarı varsa sürüşe devam etmeyin."),
  new Guide("Silecek ve cam suyu kontrolü", "Kolay", "10 dk", "Görüş güvenliği için silecek lastiklerini ve cam suyu seviyesini düzenli kontrol edin.", ["Silecek lastiklerinde yırtık, sertleşme ve camda iz bırakma olup olmadığını inceleyin.", "Cam suyu haznesine mevsime uygun ürün ekleyin.", "Silecekleri kısa süre çalıştırarak püskürtme yönünü ve temizlemeyi kontrol edin."], "Silecekleri kuru camda uzun süre çalıştırmayın; hazneye motor soğutma sıvısı koymayın."),
  new Guide("Soğutma sıvısı seviyesini gözle kontrol et", "Orta", "10 dk", "Seviye değişimleri kaçak belirtisi olabilir. Kontrol yalnızca motor tamamen soğukken yapılmalıdır.", ["Aracı düz zemine park edip motorun tamamen soğumasını bekleyin.", "Genleşme kabındaki MIN–MAX seviyesini dışarıdan kontrol edin.", "Seviye düşüyorsa izleyin ve kaçak şüphesinde servise başvurun."], "Sıcak motorda kapağı açmayın. Farklı tip soğutma sıvılarını karıştırmayın."),
  new Guide("Fren balatası aşınma belirtilerini tanı", "Orta", "10 dk gözlem", "Fren sesi, pedal hissi ve uyarı lambaları profesyonel kontrol gerektirebilir.", ["Fren uyarı lambası veya metal sürtme sesi olup olmadığını not edin.", "Pedalda titreşim, çekme veya fren mesafesinde artış varsa aracı zorlamayın.", "Balata ve disk ölçümünü uygun ekipmanla serviste yaptırın."], "Fren sistemi güvenlik açısından kritiktir; sökme ve değişimi profesyonellere bırakın."),
  new Guide("Kabin polen filtresini kontrol et", "Kolay", "20–30 dk", "Kabin filtresinin konumu araçtan araca değişir; filtre yönü ve parça kodunu doğrulayın.", ["Araç kılavuzundan filtre konumunu ve doğru parça kodunu bulun.", "Kapağı ve eski filtrenin hava akış yönünü not edin.", "Yeni filtreyi ok yönüne göre takıp kapağı tam kapatın."], "Kapak klipslerini zorlamayın. Filtre değişim aralığı için üretici önerisini izleyin.")
];

export const partReviews = [
  new PartReview("Yağ filtresi", "Orijinal", "Toyota Corolla 1.6 Valvematic", "Üretici katalog koduyla doğrulandığında ölçü ve bypass değerleri araca göre seçilir.", "Fiyatı muadil seçeneklerden yüksek olabilir.", 4.8, "Toyota / OEM tedarik", "₺450–₺850", "Fatura ve satıcıya göre değişir", "Motor kodu ve şasi numarasıyla teyit edin."),
  new PartReview("Yağ filtresi", "Muadil", "Toyota Corolla 1.6 Valvematic", "Bilinen filtre üreticilerinde uygun fiyat ve yaygın bulunurluk.", "Kalite marka ve ürün serisine göre değişir; sahte ürüne dikkat edin.", 4.2, "Bilinen filtre üreticileri", "₺180–₺450", "Marka ve satıcıya göre değişir", "Filtre kodunu OEM referansıyla karşılaştırın."),
  new PartReview("Ön fren balatası", "Orijinal", "Volkswagen Golf 1.6 TDI", "Uyum ve fren hissi için araç donanımına göre katalogdan seçilebilir.", "Maliyet yüksek olabilir; disk durumundan bağımsız değerlendirilmemeli.", 4.7, "Volkswagen / OEM tedarik", "₺1.600–₺3.200", "Fatura ve satıcıya göre değişir", "PR kodu, aks ve fren paketi uyumunu doğrulayın."),
  new PartReview("Ön fren balatası", "Muadil", "Volkswagen Golf 1.6 TDI", "Eşdeğer onaylı ürünlerde daha geniş fiyat seçeneği.", "Sertlik, toz ve ses karakteri üreticiye göre farklı olabilir.", 4.3, "Eşdeğer üretici seçenekleri", "₺900–₺2.100", "Üretici garantisine göre değişir", "E işareti/onay ve disk uyumunu kontrol edin."),
  new PartReview("Hava filtresi", "Orijinal", "Fiat Egea 1.3 Multijet", "Kutu ve kanal ölçüleri araç konfigürasyonuna göre uyumlu seçilir.", "Yetkili kanal fiyatı daha yüksek olabilir.", 4.6, "Fiat / OEM tedarik", "₺350–₺700", "Satış kanalına göre değişir", "Motor koduna ve üretim tarihine göre parça kodunu bulun."),
  new PartReview("Hava filtresi", "Muadil", "Fiat Egea 1.3 Multijet", "Düzenli değişimde ekonomik alternatifler bulunabilir.", "Ucuz ve belgesiz üründe sızdırmazlık ve filtre kâğıdı kalitesi değişebilir.", 4.1, "Bilinen filtre üreticileri", "₺160–₺400", "Marka ve satıcıya göre değişir", "Kutuya tam oturmasını ve contayı kontrol edin."),
  new PartReview("Akü 60 Ah", "Orijinal", "Honda Civic 1.6 i-VTEC", "Araç donanımıyla uyumlu kapasite ve kutup düzeni katalogdan seçilir.", "Stok ve tedarik nedeniyle fiyat değişken olabilir.", 4.5, "Araç üreticisi standardı", "₺3.200–₺5.500", "Akü üreticisi koşullarına göre", "Start-stop ve şarj sistemi gereksinimini kontrol edin."),
  new PartReview("Akü 60 Ah", "Muadil", "Honda Civic 1.6 i-VTEC", "Uygun ölçü ve doğru teknolojiyle fiyat/performans seçenekleri.", "Üretim tarihi, garanti ve soğuk marş akımı önemlidir.", 4.2, "Bilinen akü markaları", "₺2.500–₺4.800", "Marka ve kayıt şartlarına göre", "Eski akü kapasitesi ve kutup yönünü birebir doğrulayın."),
  new PartReview("Polen filtresi", "Muadil", "Renault Clio 1.0 TCe", "Standart veya karbonlu seçeneklerle farklı ihtiyaçlara uygun alternatif.", "Karbonlu ürünün fiyatı yüksek; montaj yönü yanlış olabilir.", 4.4, "Filtre üreticisi seçenekleri", "₺180–₺650", "Satıcı şartlarına göre", "Filtre yuvası ve hava akış oku yönünü kontrol edin.")
];

export const garages = [
  new Garage("Usta Garaj", "İstanbul", "Dizel motor ve emisyon", "Volkswagen · Fiat · Ford", 4.6, "Kadıköy · temsili adres", "Hafta içi 09.00–18.00 · Cumartesi 09.00–14.00", ["EGR/DPF kontrolü", "Periyodik bakım", "Arıza tespiti"], "₺₺", 38),
  new Garage("Anadolu Oto Servis", "Ankara", "Periyodik bakım ve hibrit", "Toyota · Honda · Hyundai", 4.8, "Çankaya · temsili adres", "Hafta içi 08.30–18.30 · Cumartesi 09.00–15.00", ["Periyodik bakım", "Fren kontrolü", "Hibrit sistem ön kontrolü"], "₺₺", 52),
  new Garage("Ege Motor", "İzmir", "Elektrik, klima ve arıza tespiti", "Tüm markalar", 4.4, "Bornova · temsili adres", "Hafta içi 09.00–18.00", ["Klima kontrolü", "Akü/şarj sistemi", "Elektronik arıza tarama"], "₺₺", 27),
  new Garage("Marmara Mekanik", "Bursa", "Ön takım ve fren", "Renault · Dacia · Fiat", 4.5, "Nilüfer · temsili adres", "Hafta içi 08.30–18.00 · Cumartesi 09.00–14.00", ["Fren ve disk kontrolü", "Rot/denge ayarı", "Süspansiyon inceleme"], "₺₺", 31),
  new Garage("Boğaz Oto Elektrik", "İstanbul", "Oto elektrik ve klima", "Honda · Toyota · Nissan", 4.7, "Üsküdar · temsili adres", "Hafta içi 09.00–19.00 · Cumartesi 09.00–15.00", ["Klima sistemi", "Akü ve alternatör", "Aydınlatma arızaları"], "₺₺₺", 44),
  new Garage("Başkent Dizel Servis", "Ankara", "Dizel enjeksiyon ve emisyon", "Volkswagen · Ford · Peugeot", 4.3, "Yenimahalle · temsili adres", "Hafta içi 08.30–18.00", ["Enjektör kontrolü", "EGR/DPF inceleme", "Dizel bakım"], "₺₺₺", 23),
  new Garage("Akdeniz Oto Bakım", "Antalya", "Genel bakım ve klima", "Hyundai · Renault · Dacia", 4.6, "Muratpaşa · temsili adres", "Hafta içi 09.00–18.30 · Cumartesi 09.00–14.00", ["Mevsimsel bakım", "Klima bakımı", "Sıvı ve filtre kontrolü"], "₺₺", 35),
  new Garage("Konya Motor Atölyesi", "Konya", "Motor ve aktarma", "Fiat · Toyota · Volkswagen", 4.5, "Selçuklu · temsili adres", "Hafta içi 08.30–18.00", ["Motor mekanik kontrolü", "Debriyaj/aktarma", "Yağ kaçak incelemesi"], "₺₺₺", 29),
  new Garage("Trakya Yetkin Servis", "Edirne", "Genel bakım ve fren", "Tüm markalar", 4.2, "Merkez · temsili adres", "Hafta içi 09.00–18.00", ["Periyodik bakım", "Fren kontrolü", "Akü testi"], "₺₺", 18)
];
