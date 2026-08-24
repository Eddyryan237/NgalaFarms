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
[Route("api/palm-processing")]
[Authorize]
public class PalmProcessingController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public PalmProcessingController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.PalmProcessings.OrderByDescending(p => p.ProcessingDate).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await _db.PalmProcessings.FindAsync(id);
        return p == null ? NotFound() : Ok(Map(p));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreatePalmProcessingRequest req)
    {
        var yieldPct = req.RawFruitKg > 0 ? Math.Round(req.PalmOilLitres / req.RawFruitKg * 100, 2) : 0;
        var p = new PalmProcessing
        {
            ProcessingId = await _ids.GenerateProcessingIdAsync(),
            ProcessingDate = req.ProcessingDate, RawFruitKg = req.RawFruitKg,
            PalmOilLitres = req.PalmOilLitres, ProcessingCost = req.ProcessingCost,
            LaborCost = req.LaborCost, FuelCost = req.FuelCost, WasteKg = req.WasteKg,
            YieldPercentage = yieldPct, Notes = req.Notes
        };
        _db.PalmProcessings.Add(p);

        // Decrease palm fruit inventory
        var fruitInv = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductName == "Palm Fruit");
        if (fruitInv != null)
        {
            fruitInv.CurrentQuantity = Math.Max(0, fruitInv.CurrentQuantity - req.RawFruitKg);
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryId = fruitInv.Id, TransactionType = StockTransactionType.Used,
                Quantity = req.RawFruitKg, BalanceAfter = fruitInv.CurrentQuantity,
                ReferenceId = p.ProcessingId, Description = $"Used in processing {p.ProcessingId}",
                TransactionDate = req.ProcessingDate
            });
        }

        // Increase palm oil inventory
        var oilInv = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductName == "Palm Oil");
        if (oilInv != null)
        {
            oilInv.CurrentQuantity += req.PalmOilLitres;
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryId = oilInv.Id, TransactionType = StockTransactionType.Produced,
                Quantity = req.PalmOilLitres, BalanceAfter = oilInv.CurrentQuantity,
                ReferenceId = p.ProcessingId, Description = $"Produced from processing {p.ProcessingId}",
                TransactionDate = req.ProcessingDate
            });
        }

        // Create batch
        var batchId = await _ids.GenerateBatchIdAsync();
        _db.PalmOilBatches.Add(new PalmOilBatch
        {
            BatchId = batchId, ProcessingId = p.Id, ProductionDate = req.ProcessingDate,
            QuantityLitres = req.PalmOilLitres, RemainingLitres = req.PalmOilLitres,
            StorageLocation = req.StorageLocation
        });

        // Record processing costs as expense
        var totalCost = req.ProcessingCost + req.LaborCost + req.FuelCost;
        if (totalCost > 0)
        {
            _db.Expenses.Add(new Expense
            {
                ExpenseId = await _ids.GenerateExpenseIdAsync(),
                Category = "Palm Processing", Division = ExpenseDivision.PalmOil,
                Description = $"Processing costs for {p.ProcessingId}", Amount = totalCost,
                Date = req.ProcessingDate, PaymentMethod = PaymentMethod.Cash
            });
        }

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded palm processing {p.ProcessingId}", "PalmProcessing", p.ProcessingId);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, Map(p));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.PalmProcessings.FindAsync(id);
        if (p == null) return NotFound();
        _db.PalmProcessings.Remove(p); await _db.SaveChangesAsync();
        return NoContent();
    }

    private static PalmProcessingDto Map(PalmProcessing p) => new()
    {
        Id = p.Id, ProcessingId = p.ProcessingId, ProcessingDate = p.ProcessingDate,
        RawFruitKg = p.RawFruitKg, PalmOilLitres = p.PalmOilLitres,
        ProcessingCost = p.ProcessingCost, LaborCost = p.LaborCost, FuelCost = p.FuelCost,
        WasteKg = p.WasteKg, YieldPercentage = p.YieldPercentage,
        TotalCost = p.ProcessingCost + p.LaborCost + p.FuelCost,
        Notes = p.Notes, CreatedAt = p.CreatedAt
    };
}
