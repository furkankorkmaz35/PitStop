using Microsoft.AspNetCore.Mvc;
using PitStop.Data;

namespace PitStop.Controllers;

public class MaintenanceController : Controller
{
    public IActionResult Logs()
    {
        return View(DemoData.MaintenanceLogs);
    }

    public IActionResult Guide()
    {
        return View(DemoData.Guides);
    }
}
