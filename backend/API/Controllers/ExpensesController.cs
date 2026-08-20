using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Domain.Enums;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public ExpensesController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? division, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var q = _db.Expenses.Include(e => e.Employee).AsQueryable();
        if (!string.IsNullOrEmpty(division) && Enum.TryParse<ExpenseDivision>(division, true, out var d)) q = q.Where(e => e.Division == d);
        if (from.HasValue) q = q.Where(e => e.Date >= from);
        if (to.HasValue) q = q.Where(e => e.Date <= to);
        var list = await q.OrderByDescending(e => e.Date).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var e = await _db.Expenses.Include(x => x.Employee).FirstOrDefaultAsync(x => x.Id == id);
        return e == null ? NotFound() : Ok(Map(e));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateExpenseRequest req)
    {
        var e = new Expense
        {
            ExpenseId = await _ids.GenerateExpenseIdAsync(),
            Category = req.Category, Division = req.Division, Description = req.Description,
            Amount = req.Amount, Date = req.Date, PaymentMethod = req.PaymentMethod,
            EmployeeId = req.EmployeeId, Notes = req.Notes
        };
        _db.Expenses.Add(e);
        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded expense {e.ExpenseId}", "Expense", e.ExpenseId);
        return CreatedAtAction(nameof(Get), new { id = e.Id }, Map(e));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _db.Expenses.FindAsync(id);
        if (e == null) return NotFound();
        e.IsDeleted = true; await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ExpenseDto Map(Expense e) => new()
    {
        Id = e.Id, ExpenseId = e.ExpenseId, Category = e.Category, Division = e.Division,
        Description = e.Description, Amount = e.Amount, Date = e.Date,
        PaymentMethod = e.PaymentMethod, EmployeeId = e.EmployeeId,
        EmployeeName = e.Employee?.FullName, Notes = e.Notes, CreatedAt = e.CreatedAt
    };
}
