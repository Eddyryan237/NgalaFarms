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
[Route("api/palm-harvests")]
[Authorize]
public class PalmHarvestsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public PalmHarvestsController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? plantationId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var q = _db.PalmHarvests.Include(h => h.Plantation).Include(h => h.PalmBlock).AsQueryable();
        if (plantationId.HasValue) q = q.Where(h => h.PlantationId == plantationId);
        if (from.HasValue) q = q.Where(h => h.HarvestDate >= from);
        if (to.HasValue) q = q.Where(h => h.HarvestDate <= to);
        var list = await q.OrderByDescending(h => h.HarvestDate).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var h = await _db.PalmHarvests.Include(x => x.Plantation).Include(x => x.PalmBlock).FirstOrDefaultAsync(x => x.Id == id);
        return h == null ? NotFound() : Ok(Map(h));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreatePalmHarvestRequest req)
    {
        var plantationIds = (req.PlantationIds ?? new List<int> { req.PlantationId }).Distinct().ToList();
        if (plantationIds.Count == 0 || plantationIds.Contains(0))
            return BadRequest(new { message = "Select at least one plantation." });
        var validPlantationIds = await _db.Plantations.Where(p => plantationIds.Contains(p.Id) && !p.IsDeleted).Select(p => p.Id).ToListAsync();
        if (validPlantationIds.Count != plantationIds.Count)
        {
            return BadRequest(new { message = "One or more selected plantations do not exist." });
        }
        req.PlantationId = plantationIds[0];
        if (plantationIds.Count > 1) req.PalmBlockId = null;

        if (req.PalmBlockId.HasValue)
        {
            var blockExists = await _db.PalmBlocks.AnyAsync(b => b.Id == req.PalmBlockId.Value && b.PlantationId == req.PlantationId && !b.IsDeleted);
            if (!blockExists)
            {
                return BadRequest(new { message = "Selected palm block does not exist for the chosen plantation." });
            }
        }

        var h = new PalmHarvest
        {
            HarvestId = await _ids.GenerateHarvestIdAsync(),
            PlantationId = req.PlantationId, PlantationIds = string.Join(",", plantationIds), PalmBlockId = req.PalmBlockId,
            HarvestDate = req.HarvestDate, NumberOfBunches = req.NumberOfBunches,
            TotalWeightKg = req.TotalWeightKg, HarvestTeam = req.HarvestTeam,
            LaborCost = req.LaborCost, Notes = req.Notes
        };
        _db.PalmHarvests.Add(h);

        // Update palm fruit inventory
        var inv = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductName == "Palm Fruit");
        if (inv != null)
        {
            inv.CurrentQuantity += req.TotalWeightKg;
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryId = inv.Id, TransactionType = StockTransactionType.Produced,
                Quantity = req.TotalWeightKg, BalanceAfter = inv.CurrentQuantity,
                ReferenceId = h.HarvestId, Description = $"Harvest {h.HarvestId}",
                TransactionDate = req.HarvestDate
            });
        }

        // Keep older API clients compatible, but do not create a zero-value expense.
        if (req.LaborCost > 0)
        {
            _db.Expenses.Add(new Expense
            {
                ExpenseId = await _ids.GenerateExpenseIdAsync(),
                Category = "Harvest Labor", Division = ExpenseDivision.PalmOil,
                Description = $"Labor cost for harvest {h.HarvestId}", Amount = req.LaborCost,
                Date = req.HarvestDate, PaymentMethod = PaymentMethod.Cash
            });
        }

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded palm harvest {h.HarvestId}", "PalmHarvest", h.HarvestId);
        return CreatedAtAction(nameof(Get), new { id = h.Id }, Map(h));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePalmHarvestRequest req)
    {
        var h = await _db.PalmHarvests.FindAsync(id);
        if (h == null) return NotFound();

        var plantationIds = (req.PlantationIds ?? new List<int> { req.PlantationId }).Distinct().ToList();
        if (plantationIds.Count == 0 || plantationIds.Contains(0))
            return BadRequest(new { message = "Select at least one plantation." });
        var validPlantationIds = await _db.Plantations.Where(p => plantationIds.Contains(p.Id) && !p.IsDeleted).Select(p => p.Id).ToListAsync();
        if (validPlantationIds.Count != plantationIds.Count)
        {
            return BadRequest(new { message = "One or more selected plantations do not exist." });
        }
        req.PlantationId = plantationIds[0];
        if (plantationIds.Count > 1) req.PalmBlockId = null;

        if (req.PalmBlockId.HasValue)
        {
            var blockExists = await _db.PalmBlocks.AnyAsync(b => b.Id == req.PalmBlockId.Value && b.PlantationId == req.PlantationId && !b.IsDeleted);
            if (!blockExists)
            {
                return BadRequest(new { message = "Selected palm block does not exist for the chosen plantation." });
            }
        }

        h.PlantationId = req.PlantationId; h.PlantationIds = string.Join(",", plantationIds); h.PalmBlockId = req.PalmBlockId;
        h.HarvestDate = req.HarvestDate; h.NumberOfBunches = req.NumberOfBunches;
        h.TotalWeightKg = req.TotalWeightKg; h.HarvestTeam = req.HarvestTeam;
        h.LaborCost = req.LaborCost; h.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return Ok(Map(h));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        var h = await _db.PalmHarvests.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (h == null) return NotFound();
        h.IsDeleted = true; await _db.SaveChangesAsync();
        return Ok(new { message = "Palm harvest deleted successfully" });
    }

    private static PalmHarvestDto Map(PalmHarvest h) => new()
    {
        Id = h.Id, HarvestId = h.HarvestId, PlantationId = h.PlantationId,
        PlantationIds = string.IsNullOrWhiteSpace(h.PlantationIds) ? new List<int> { h.PlantationId } : h.PlantationIds.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList(),
        PlantationName = h.Plantation?.Name ?? "", PalmBlockId = h.PalmBlockId,
        BlockName = h.PalmBlock?.Name, HarvestDate = h.HarvestDate,
        NumberOfBunches = h.NumberOfBunches, TotalWeightKg = h.TotalWeightKg,
        HarvestTeam = h.HarvestTeam, LaborCost = h.LaborCost, Notes = h.Notes,
        IsProcessed = h.IsProcessed, CreatedAt = h.CreatedAt
    };
}
