using Microsoft.AspNetCore.Mvc;
using PitStop.Data;

namespace PitStop.Controllers;

public class ReviewController : Controller
{
    public IActionResult PartReviews()
    {
        return View(DemoData.PartReviews);
    }

    public IActionResult GarageFinder(string? city)
    {
        var garages = DemoData.Garages
            .Where(garage =>
                string.IsNullOrWhiteSpace(city) ||
                garage.City.Contains(city, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return View(garages);
    }
}
