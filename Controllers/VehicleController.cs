using Microsoft.AspNetCore.Mvc;
using PitStop.Data;
using PitStop.Models;

namespace PitStop.Controllers;

public class VehicleController : Controller
{
    public IActionResult Catalog(string? brand, string? engine)
    {
        var vehicles = DemoData.Vehicles
            .Where(vehicle =>
                (string.IsNullOrWhiteSpace(brand) ||
                 vehicle.Brand.Contains(brand, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(engine) ||
                 vehicle.Engine.Contains(engine, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        return View(vehicles);
    }

    public IActionResult Detail(string brand = "Toyota", string model = "Corolla")
    {
        var vehicle = DemoData.Vehicles.FirstOrDefault(item =>
            item.Brand == brand && item.Model == model);

        return View(vehicle ?? DemoData.Vehicles[0]);
    }
}
