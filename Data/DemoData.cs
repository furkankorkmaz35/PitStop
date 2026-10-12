using PitStop.Models;

namespace PitStop.Data;

public static class DemoData
{
    public static IReadOnlyList<Vehicle> Vehicles { get; } = new List<Vehicle>
    {
        new(
            "Toyota",
            "Corolla",
            "1.6 Valvematic",
            2015,
            132,
            "Benzin",
            "Multimedya ekranında donma; düzenli bakımda yağ tüketimini takip edin.",
            "Düşük"),
        new(
            "Volkswagen",
            "Golf",
            "1.6 TDI",
            2014,
            105,
            "Dizel",
            "EGR ve DPF tıkanması kısa mesafe kullanımında görülebilir.",
            "Orta"),
        new(
            "Fiat",
            "Egea",
            "1.3 Multijet",
            2018,
            95,
            "Dizel",
            "Debriyaj ve ön takım aşınması kullanım koşullarına bağlıdır.",
            "Orta"),
        new(
            "Honda",
            "Civic",
            "1.6 i-VTEC",
            2016,
            125,
            "Benzin",
            "Klima kompresörü ve süspansiyon sesleri kontrol edilmelidir.",
            "Düşük")
    };

    public static IReadOnlyList<MaintenanceLog> MaintenanceLogs { get; } = new List<MaintenanceLog>
    {
        new("12.09.2026", "Toyota Corolla 1.6", "Periyodik bakım", "Yağ + filtre seti", 3850, "Özel servis"),
        new("08.06.2026", "VW Golf 1.6 TDI", "Fren bakımı", "Ön balata", 2700, "Usta önerisi"),
        new("21.04.2026", "Fiat Egea 1.3", "Akü değişimi", "60 Ah akü", 4200, "Yetkili servis")
    };

    public static IReadOnlyList<Guide> Guides { get; } = new List<Guide>
    {
        new(
            "Motor yağı ve filtre değişimi",
            "Orta",
            "60–90 dk",
            "Doğru yağ standardını kontrol edin; kullanılmış yağı atık toplama noktasına verin."),
        new(
            "Hava filtresi kontrolü",
            "Kolay",
            "15 dk",
            "Filtreyi ışığa tutarak kirliliği inceleyin ve araç kitapçığındaki aralığı izleyin."),
        new(
            "Akü ve kutup başı kontrolü",
            "Kolay",
            "20 dk",
            "Kontrol öncesi kontağı kapatın; kutup başlarında oksitlenme olup olmadığına bakın.")
    };

    public static IReadOnlyList<PartReview> PartReviews { get; } = new List<PartReview>
    {
        new("Yağ filtresi", "OEM", "Corolla 1.6", "Üretici standardında uyum", "Fiyatı daha yüksek", 4.7m),
        new("Yağ filtresi", "Yan sanayi", "Corolla 1.6", "Uygun fiyat, yaygın bulunurluk", "Üretici ve seri bazında kalite değişir", 4.1m),
        new("Ön fren balatası", "OEM", "Golf 1.6 TDI", "Öngörülebilir uyum", "Maliyet yüksek olabilir", 4.5m)
    };

    public static IReadOnlyList<Garage> Garages { get; } = new List<Garage>
    {
        new("Usta Garaj", "İstanbul", "Dizel ve EGR", "Volkswagen · Fiat", 4.6m),
        new("Anadolu Oto Servis", "Ankara", "Periyodik bakım", "Toyota · Honda", 4.8m),
        new("Ege Motor", "İzmir", "Elektrik ve klima", "Tüm markalar", 4.4m)
    };
}
