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
[Route("api/cattle")]
[Authorize]
public class CattleController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public CattleController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var q = _db.Cattle.AsQueryable();
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<CattleStatus>(status, true, out var s)) q = q.Where(c => c.Status == s);
        var list = await q.OrderBy(c => c.CattleId).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Cattle.FindAsync(id);
        return c == null ? NotFound() : Ok(Map(c));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateCattleRequest req)
    {
        var c = new Cattle
        {
            CattleId = await _ids.GenerateCattleIdAsync(),
            TagNumber = null,
            Name = req.Name,
            Sex = req.Sex,
            Category = req.Category,
            DateOfBirth = req.DateOfBirth,
            AcquisitionDate = req.AcquisitionDate,
            AcquisitionCost = req.AcquisitionCost,
            CurrentWeightKg = req.CurrentWeightKg,
            ParentInfo = req.ParentInfo,
            Location = req.Location,
            Notes = req.Notes,
            Remarks = req.Remarks
        };
        c.TagNumber = c.CattleId;
        _db.Cattle.Add(c);
        await _db.SaveChangesAsync();

        // Record initial weight
        if (req.CurrentWeightKg is > 0)
            _db.CattleWeightRecords.Add(new CattleWeightRecord { CattleId = c.Id, RecordDate = req.AcquisitionDate, WeightKg = req.CurrentWeightKg.Value, Notes = "Initial weight at acquisition" });

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Added cattle {c.CattleId}", "Cattle", c.CattleId);
        return CreatedAtAction(nameof(Get), new { id = c.Id }, Map(c));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCattleRequest req)
    {
        var c = await _db.Cattle.FindAsync(id);
        if (c == null) return NotFound();
        c.TagNumber = req.TagNumber; c.Name = req.Name; c.Sex = req.Sex; c.Category = req.Category;
        c.DateOfBirth = req.DateOfBirth; c.AcquisitionDate = req.AcquisitionDate;
        c.AcquisitionCost = req.AcquisitionCost; c.CurrentWeightKg = req.CurrentWeightKg;
        c.ParentInfo = req.ParentInfo; c.Location = req.Location; c.Notes = req.Notes; c.Remarks = req.Remarks;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Cattle.FindAsync(id);
        if (c == null) return NotFound();
        _db.Cattle.Remove(c); await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Health Records
    [HttpGet("health")]
    public async Task<IActionResult> GetHealthRecords([FromQuery] int? cattleId)
    {
        var q = _db.CattleHealthRecords.Include(h => h.Cattle).AsQueryable();
        if (cattleId.HasValue) q = q.Where(h => h.CattleId == cattleId);
        var list = await q.OrderByDescending(h => h.RecordDate).ToListAsync();
        return Ok(list.Select(h => new CattleHealthRecordDto { Id = h.Id, CattleId = h.CattleId, CattleTag = h.Cattle?.CattleId ?? "", RecordDate = h.RecordDate, Condition = h.Condition, Treatment = h.Treatment, Medication = h.Medication, TreatmentCost = h.TreatmentCost, VeterinaryName = h.VeterinaryName, FollowUpDate = h.FollowUpDate, Notes = h.Notes, CreatedAt = h.CreatedAt }));
    }

    [HttpPost("health")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateHealthRecord([FromBody] CreateCattleHealthRecordRequest req)
    {
        var h = new CattleHealthRecord { CattleId = req.CattleId, RecordDate = req.RecordDate, Condition = req.Condition, Treatment = req.Treatment, Medication = req.Medication, TreatmentCost = req.TreatmentCost, VeterinaryName = req.VeterinaryName, FollowUpDate = req.FollowUpDate, Notes = req.Notes };
        _db.CattleHealthRecords.Add(h);
        if (req.TreatmentCost > 0)
        {
            var cattle = await _db.Cattle.FindAsync(req.CattleId);
            _db.Expenses.Add(new Expense { ExpenseId = await _ids.GenerateExpenseIdAsync(), Category = "Veterinary Care", Division = ExpenseDivision.Cattle, Description = $"Vet treatment for {cattle?.CattleId ?? req.CattleId.ToString()}: {req.Condition}", Amount = req.TreatmentCost, Date = req.RecordDate, PaymentMethod = PaymentMethod.Cash });
        }
        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, "Recorded cattle health", "CattleHealth", req.CattleId.ToString());
        return Ok(h);
    }

    // ── Vaccinations
    [HttpGet("vaccinations")]
    public async Task<IActionResult> GetVaccinations([FromQuery] int? cattleId)
    {
        var q = _db.CattleVaccinations.Include(v => v.Cattle).AsQueryable();
        if (cattleId.HasValue) q = q.Where(v => v.CattleId == cattleId);
        var list = await q.OrderByDescending(v => v.VaccinationDate).ToListAsync();
        return Ok(list.Select(v => new CattleVaccinationDto { Id = v.Id, CattleId = v.CattleId, CattleTag = v.Cattle?.CattleId ?? "", VaccineName = v.VaccineName, VaccinationDate = v.VaccinationDate, NextDueDate = v.NextDueDate, AdministeredBy = v.AdministeredBy, Cost = v.Cost, Notes = v.Notes }));
    }

    [HttpPost("vaccinations")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateVaccination([FromBody] CreateCattleVaccinationRequest req)
    {
        var v = new CattleVaccination { CattleId = req.CattleId, VaccineName = req.VaccineName, VaccinationDate = req.VaccinationDate, NextDueDate = req.NextDueDate, AdministeredBy = req.AdministeredBy, Cost = req.Cost, Notes = req.Notes };
        _db.CattleVaccinations.Add(v);
        if (req.Cost > 0)
        {
            var cattle = await _db.Cattle.FindAsync(req.CattleId);
            _db.Expenses.Add(new Expense { ExpenseId = await _ids.GenerateExpenseIdAsync(), Category = "Vaccination", Division = ExpenseDivision.Cattle, Description = $"Vaccination ({req.VaccineName}) for {cattle?.CattleId ?? req.CattleId.ToString()}", Amount = req.Cost, Date = req.VaccinationDate, PaymentMethod = PaymentMethod.Cash });
        }
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    // ── Feeding
    [HttpGet("feeding")]
    public async Task<IActionResult> GetFeeding([FromQuery] int? cattleId)
    {
        var q = _db.CattleFeedings.Include(f => f.Cattle).AsQueryable();
        if (cattleId.HasValue) q = q.Where(f => f.CattleId == cattleId);
        var list = await q.OrderByDescending(f => f.FeedingDate).ToListAsync();
        return Ok(list.Select(f => new CattleFeedingDto { Id = f.Id, CattleId = f.CattleId, CattleTag = f.Cattle?.CattleId, GroupName = f.GroupName, FeedingDate = f.FeedingDate, FeedType = f.FeedType, QuantityKg = f.QuantityKg, Cost = f.Cost, Notes = f.Notes }));
    }

    [HttpPost("feeding")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateFeeding([FromBody] CreateCattleFeedingRequest req)
    {
        var f = new CattleFeeding { CattleId = req.CattleId, GroupName = req.GroupName, FeedingDate = req.FeedingDate, FeedType = req.FeedType, QuantityKg = req.QuantityKg, Cost = req.Cost, Notes = req.Notes };
        _db.CattleFeedings.Add(f);
        if (req.Cost > 0)
        {
            _db.Expenses.Add(new Expense { ExpenseId = await _ids.GenerateExpenseIdAsync(), Category = "Cattle Feed", Division = ExpenseDivision.Cattle, Description = $"Feed ({req.FeedType}) – {req.QuantityKg}kg", Amount = req.Cost, Date = req.FeedingDate, PaymentMethod = PaymentMethod.Cash });
        }
        await _db.SaveChangesAsync();
        return Ok(f);
    }

    // ── Weight
    [HttpGet("weights")]
    public async Task<IActionResult> GetWeights([FromQuery] int? cattleId)
    {
        var q = _db.CattleWeightRecords.Include(w => w.Cattle).AsQueryable();
        if (cattleId.HasValue) q = q.Where(w => w.CattleId == cattleId);
        var list = await q.OrderBy(w => w.RecordDate).ToListAsync();
        return Ok(list.Select(w => new CattleWeightRecordDto { Id = w.Id, CattleId = w.CattleId, CattleTag = w.Cattle?.CattleId ?? "", RecordDate = w.RecordDate, WeightKg = w.WeightKg, Notes = w.Notes }));
    }

    [HttpPost("weights")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateWeight([FromBody] CreateCattleWeightRecordRequest req)
    {
        var w = new CattleWeightRecord { CattleId = req.CattleId, RecordDate = req.RecordDate, WeightKg = req.WeightKg, Notes = req.Notes };
        _db.CattleWeightRecords.Add(w);
        var cattle = await _db.Cattle.FindAsync(req.CattleId);
        if (cattle != null) { cattle.CurrentWeightKg = req.WeightKg; }
        await _db.SaveChangesAsync();
        return Ok(w);
    }

    // ── Purchases
    [HttpGet("purchases")]
    public async Task<IActionResult> GetPurchases()
    {
        var list = await _db.CattlePurchases.Include(p => p.Cattle).Include(p => p.Supplier).OrderByDescending(p => p.PurchaseDate).ToListAsync();
        return Ok(list.Select(p => new CattlePurchaseDto { Id = p.Id, PurchaseId = p.PurchaseId, CattleId = p.CattleId, CattleTag = p.Cattle?.CattleId ?? "", SupplierId = p.SupplierId, SupplierName = p.SupplierName, PurchaseDate = p.PurchaseDate, PurchasePrice = p.PurchasePrice, WeightAtPurchaseKg = p.WeightAtPurchaseKg, PaymentStatus = p.PaymentStatus.ToString(), Notes = p.Notes }));
    }

    [HttpPost("purchases")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreatePurchase([FromBody] CreateCattleRequest req)
    {
        // Create cattle first
        var c = new Cattle { CattleId = await _ids.GenerateCattleIdAsync(), TagNumber = null, Name = req.Name, Sex = req.Sex, Category = req.Category, DateOfBirth = req.DateOfBirth, AcquisitionDate = req.AcquisitionDate, AcquisitionCost = req.AcquisitionCost, CurrentWeightKg = req.CurrentWeightKg, ParentInfo = req.ParentInfo, Location = req.Location, Notes = req.Notes, Remarks = req.Remarks };
        c.TagNumber = c.CattleId;
        _db.Cattle.Add(c);
        await _db.SaveChangesAsync();

        // Record purchase
        var p = new CattlePurchase { PurchaseId = await _ids.GeneratePurchaseIdAsync(), CattleId = c.Id, SupplierName = "Unknown", PurchaseDate = req.AcquisitionDate, PurchasePrice = req.AcquisitionCost, WeightAtPurchaseKg = req.CurrentWeightKg ?? 0 };
        _db.CattlePurchases.Add(p);

        // Record as expense
        _db.Expenses.Add(new Expense { ExpenseId = await _ids.GenerateExpenseIdAsync(), Category = "Cattle Acquisition", Division = ExpenseDivision.Cattle, Description = $"Purchase of cattle {c.CattleId}", Amount = req.AcquisitionCost, Date = req.AcquisitionDate, PaymentMethod = PaymentMethod.Cash });

        await _db.SaveChangesAsync();
        return Ok(Map(c));
    }

    // ── Sales
    [HttpGet("sales")]
    public async Task<IActionResult> GetCattleSales()
    {
        var list = await _db.CattleSales.Include(s => s.Cattle).Include(s => s.Customer).OrderByDescending(s => s.SaleDate).ToListAsync();
        return Ok(list.Select(s => new CattleSaleDto { Id = s.Id, SaleId = s.SaleId, CattleId = s.CattleId, CattleTag = s.Cattle?.CattleId ?? "", CustomerId = s.CustomerId, CustomerName = s.CustomerName, SaleDate = s.SaleDate, SalePrice = s.SalePrice, WeightAtSaleKg = s.WeightAtSaleKg, PaymentStatus = s.PaymentStatus.ToString(), Notes = s.Notes }));
    }

    [HttpPost("sales")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateCattleSale([FromBody] CreateCattleSaleRequest req)
    {
        var cattle = await _db.Cattle.FindAsync(req.CattleId);
        if (cattle == null) return NotFound(new { message = "Cattle not found" });

        var s = new CattleSale { SaleId = await _ids.GenerateCattleSaleIdAsync(), CattleId = req.CattleId, CustomerId = req.CustomerId, CustomerName = req.CustomerName, SaleDate = req.SaleDate, SalePrice = req.SalePrice, WeightAtSaleKg = req.WeightAtSaleKg, PaymentStatus = req.PaymentStatus, Notes = req.Notes };
        _db.CattleSales.Add(s);

        // Update cattle status
        cattle.Status = CattleStatus.Sold;

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded cattle sale {s.SaleId}", "CattleSale", s.SaleId);
        return Ok(s);
    }

    private static CattleDto Map(Cattle c) => new()
    {
        Id = c.Id,
        CattleId = c.CattleId,
        TagNumber = c.TagNumber,
        Name = c.Name,
        Sex = c.Sex,
        Category = c.Category,
        DateOfBirth = c.DateOfBirth,
        AcquisitionDate = c.AcquisitionDate,
        AcquisitionCost = c.AcquisitionCost,
        Status = c.Status,
        CurrentWeightKg = c.CurrentWeightKg,
        ParentInfo = c.ParentInfo,
        Location = c.Location,
        Notes = c.Notes,
        Remarks = c.Remarks,
        AgeMonths = (int)((DateTime.UtcNow - c.DateOfBirth).TotalDays / 30.44),
        CreatedAt = c.CreatedAt
    };
}
