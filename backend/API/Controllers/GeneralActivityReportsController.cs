using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/general-activity-reports")]
[Authorize(Roles = "Founder,Manager")]
public class GeneralActivityReportsController : ControllerBase
{
    private static readonly string[] Categories = ["Palm", "Cattle", "Sheep"];
    private readonly NgalaFarmsDbContext _db;

    public GeneralActivityReportsController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reports = await _db.GeneralActivityReports
            .OrderByDescending(report => report.ReportDate)
            .ThenByDescending(report => report.CreatedAt)
            .ToListAsync();
        return Ok(reports);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Create([FromBody] GeneralActivityReport report)
    {
        if (report == null || !Categories.Contains(report.Category, StringComparer.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(report.Report))
            return BadRequest(new { message = "Choose Palm, Cattle, or Sheep and provide a report." });

        report.Category = Categories.First(category => category.Equals(report.Category, StringComparison.OrdinalIgnoreCase));
        report.Report = report.Report.Trim();
        report.ReportDate = report.ReportDate == default ? DateTime.UtcNow.Date : report.ReportDate.Date;
        report.SubmittedBy = User.Identity?.Name ?? "Manager";
        _db.GeneralActivityReports.Add(report);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = report.Id }, report);
    }
}