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
[Route("api/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public EmployeesController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Employees.OrderBy(e => e.FullName).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var e = await _db.Employees.FindAsync(id);
        return e == null ? NotFound() : Ok(Map(e));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest req)
    {
        var e = new Employee
        {
            EmployeeId = await _ids.GenerateEmployeeIdAsync(),
            FullName = req.FullName,
            Phone = req.Phone,
            Email = req.Email,
            Address = req.Address,
            Position = req.Position,
            Department = req.Department,
            MonthlySalary = req.MonthlySalary,
            EmploymentDate = req.EmploymentDate,
            Status = req.Status,
            EmergencyContact = req.EmergencyContact,
            EmergencyPhone = req.EmergencyPhone,
            Notes = req.Notes
        };
        _db.Employees.Add(e);
        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Added employee {e.EmployeeId}", "Employee", e.EmployeeId);
        return CreatedAtAction(nameof(Get), new { id = e.Id }, Map(e));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateEmployeeRequest req)
    {
        var e = await _db.Employees.FindAsync(id);
        if (e == null) return NotFound();
        e.FullName = req.FullName; e.Phone = req.Phone; e.Email = req.Email;
        e.Address = req.Address; e.Position = req.Position; e.Department = req.Department;
        e.MonthlySalary = req.MonthlySalary; e.EmploymentDate = req.EmploymentDate;
        e.Status = req.Status; e.EmergencyContact = req.EmergencyContact;
        e.EmergencyPhone = req.EmergencyPhone; e.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _db.Employees.FindAsync(id);
        if (e == null) return NotFound();
        e.IsDeleted = true; await _db.SaveChangesAsync();
        return NoContent();
    }

    private static EmployeeDto Map(Employee e) => new()
    {
        Id = e.Id,
        EmployeeId = e.EmployeeId,
        FullName = e.FullName,
        Phone = e.Phone,
        Email = e.Email,
        Address = e.Address,
        Position = e.Position,
        Department = e.Department,
        MonthlySalary = e.MonthlySalary,
        EmploymentDate = e.EmploymentDate,
        Status = e.Status,
        EmergencyContact = e.EmergencyContact,
        EmergencyPhone = e.EmergencyPhone,
        Notes = e.Notes,
        CreatedAt = e.CreatedAt
    };
}

[ApiController]
[Route("api/payroll")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    public PayrollController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? period)
    {
        var q = _db.Salaries.Include(s => s.Employee).AsQueryable();
        if (!string.IsNullOrEmpty(period)) q = q.Where(s => s.Period == period);
        var list = await q.OrderByDescending(s => s.PeriodStart).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateSalaryRequest req)
    {
        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp == null) return NotFound(new { message = "Employee not found" });
        var s = new Salary { EmployeeId = req.EmployeeId, Amount = req.Amount, Period = req.Period, PeriodStart = req.PeriodStart, PeriodEnd = req.PeriodEnd, PaymentDate = req.PaymentDate, Status = req.Status, PaymentMethod = req.PaymentMethod, Notes = req.Notes };
        _db.Salaries.Add(s);
        await _db.SaveChangesAsync();
        if (s.Status == SalaryStatus.Paid)
        {
            _db.Expenses.Add(CreateSalaryExpense(s, emp));
        }
        await _db.SaveChangesAsync();
        return Ok(Map(s));
    }

    [HttpPatch("{id:int}/mark-paid")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> MarkPaid(int id)
    {
        var s = await _db.Salaries.FindAsync(id);
        if (s == null) return NotFound();
        s.Status = SalaryStatus.Paid; s.PaymentDate = DateTime.UtcNow;
        var emp = await _db.Employees.FindAsync(s.EmployeeId);
        if (emp == null) return BadRequest(new { message = "Employee not found for salary" });
        if (!await _db.Expenses.AnyAsync(e => e.SalaryId == s.Id))
        {
            _db.Expenses.Add(CreateSalaryExpense(s, emp));
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private Expense CreateSalaryExpense(Salary salary, Employee employee) => new()
    {
        ExpenseId = $"EXP-SAL-{salary.Id}-{salary.PeriodStart:yyyyMM}",
        SalaryId = salary.Id,
        EmployeeId = salary.EmployeeId,
        Category = "Salary",
        Division = ExpenseDivision.General,
        Description = $"Salary payment for {employee.FullName} ({salary.Period})",
        Amount = salary.Amount,
        Date = salary.PaymentDate ?? DateTime.UtcNow,
        PaymentMethod = salary.PaymentMethod,
        Notes = salary.Notes
    };

    private static SalaryDto Map(Salary s) => new()
    {
        Id = s.Id,
        EmployeeId = s.EmployeeId,
        EmployeeName = s.Employee?.FullName ?? "",
        EmployeePosition = s.Employee?.Position ?? "",
        Amount = s.Amount,
        Period = s.Period,
        PeriodStart = s.PeriodStart,
        PeriodEnd = s.PeriodEnd,
        PaymentDate = s.PaymentDate,
        Status = s.Status,
        PaymentMethod = s.PaymentMethod,
        Notes = s.Notes
    };
}
