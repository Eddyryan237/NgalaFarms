using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IWeeklyReportService _svc;
    public ReportsController(IWeeklyReportService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllReportsAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _svc.GetReportByIdAsync(id);
        return r == null ? NotFound() : Ok(r);
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Generate([FromQuery] DateTime? weekStart)
    {
        var start = weekStart ?? GetMondayOfWeek(DateTime.UtcNow);
        var report = await _svc.GenerateWeeklyReportAsync(start);
        return Ok(report);
    }

    private static DateTime GetMondayOfWeek(DateTime date)
    {
        int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }
}
