using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IWeeklyReportService _svc;
    private readonly NgalaFarms.Infrastructure.Data.NgalaFarmsDbContext _db;

    public ReportsController(IWeeklyReportService svc, NgalaFarms.Infrastructure.Data.NgalaFarmsDbContext db) { _svc = svc; _db = db; }

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

    // Daily report - aggregates items for a single date
    [HttpGet("daily")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Daily([FromQuery] DateTime date)
    {
        var start = date.Date;
        var end = start.AddDays(1);

        var expenses = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= start && e.Date < end).ToListAsync();
        var production = await _db.Productions.Where(p => p.Date >= start && p.Date < end).ToListAsync();
        var sales = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate < end).ToListAsync();
        var operations = await _db.DailyOperations.Where(o => !o.IsDeleted && o.Date >= start && o.Date < end).ToListAsync();
        var harvests = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= start && h.HarvestDate < end).ToListAsync();

        return Ok(new {
            date = start,
            expenses, production, sales, operations, harvests,
            totals = new {
                expensesTotal = expenses.Sum(e => e.Amount),
                productionCount = production.Count,
                salesTotal = sales.Sum(s => s.TotalPrice),
                salesLitres = sales.Sum(s => s.QuantityLitres),
                harvestKg = harvests.Sum(h => h.TotalWeightKg)
            }
        });
    }

    // Monthly report: last {months} months aggregated
    [HttpGet("monthly")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Monthly([FromQuery] int months = 1)
    {
        var end = DateTime.UtcNow.Date.AddDays(1);
        var start = end.AddMonths(-months);

        var expenses = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= start && e.Date < end).ToListAsync();
        var production = await _db.Productions.Where(p => p.Date >= start && p.Date < end).ToListAsync();
        var sales = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate < end).ToListAsync();
        var operations = await _db.DailyOperations.Where(o => !o.IsDeleted && o.Date >= start && o.Date < end).ToListAsync();
        var harvests = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= start && h.HarvestDate < end).ToListAsync();

        return Ok(new { start, end = end.AddDays(-1), expenses, production, sales, operations, harvests });
    }

    // Yearly report: last {years} years aggregated
    [HttpGet("yearly")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Yearly([FromQuery] int years = 1)
    {
        var end = DateTime.UtcNow.Date.AddDays(1);
        var start = end.AddYears(-years);

        var expenses = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= start && e.Date < end).ToListAsync();
        var production = await _db.Productions.Where(p => p.Date >= start && p.Date < end).ToListAsync();
        var sales = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate < end).ToListAsync();
        var operations = await _db.DailyOperations.Where(o => !o.IsDeleted && o.Date >= start && o.Date < end).ToListAsync();
        var harvests = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= start && h.HarvestDate < end).ToListAsync();

        return Ok(new { start, end = end.AddDays(-1), expenses, production, sales, operations, harvests });
    }

    private static DateTime GetMondayOfWeek(DateTime date)
    {
        int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }
}
