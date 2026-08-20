using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Founder")]
public class AdminController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(NgalaFarmsDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpPost("clear-data")]
    public async Task<IActionResult> ClearAllData()
    {
        try
        {
            // Delete in order of dependencies
            _db.CattleVaccinations.RemoveRange(_db.CattleVaccinations);
            _db.CattleHealthRecords.RemoveRange(_db.CattleHealthRecords);
            _db.CattleWeightRecords.RemoveRange(_db.CattleWeightRecords);
            _db.Expenses.RemoveRange(_db.Expenses);
            _db.Sales.RemoveRange(_db.Sales);
            _db.Productions.RemoveRange(_db.Productions);
            _db.PalmProcessings.RemoveRange(_db.PalmProcessings);
            _db.PalmHarvests.RemoveRange(_db.PalmHarvests);
            _db.Notifications.RemoveRange(_db.Notifications);
            _db.Salaries.RemoveRange(_db.Salaries);
            _db.Inventories.RemoveRange(_db.Inventories);
            _db.StockTransactions.RemoveRange(_db.StockTransactions);

            var settings = await _db.CompanySettings.FirstOrDefaultAsync();
            if (settings != null)
                settings.SeedDataEnabled = false;

            await _db.SaveChangesAsync();

            _logger.LogInformation("All data cleared by founder for testing at {Time}", DateTime.UtcNow);
            return Ok(new { message = "All data cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing data");
            return BadRequest(new { message = "Error clearing data: " + ex.Message });
        }
    }

    [HttpPost("delete-record")]
    public async Task<IActionResult> DeleteRecord([FromBody] DeleteRecordRequest req)
    {
        try
        {
            if (req.EntityType == "Expense")
            {
                var expense = await _db.Expenses.FindAsync(req.Id);
                if (expense != null)
                    _db.Expenses.Remove(expense);
            }
            else if (req.EntityType == "Production")
            {
                var production = await _db.Productions.FindAsync(req.Id);
                if (production != null)
                    _db.Productions.Remove(production);
            }
            else if (req.EntityType == "Sale")
            {
                var sale = await _db.Sales.FindAsync(req.Id);
                if (sale != null)
                    _db.Sales.Remove(sale);
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Record deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class DeleteRecordRequest
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
}
