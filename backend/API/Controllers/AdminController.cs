using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Founder")]
public class AdminController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    public AdminController(NgalaFarmsDbContext db) => _db = db;

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
