using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    public InventoryController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Inventories.ToListAsync();
        return Ok(list.Select(i => new InventoryDto
        {
            Id = i.Id, ProductName = i.ProductName, Unit = i.Unit,
            CurrentQuantity = i.CurrentQuantity, MinimumQuantity = i.MinimumQuantity,
            StorageLocation = i.StorageLocation,
            IsLowStock = i.CurrentQuantity <= i.MinimumQuantity,
            Notes = i.Notes
        }));
    }

    [HttpGet("{id:int}/transactions")]
    public async Task<IActionResult> GetTransactions(int id)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv == null) return NotFound();
        var txns = await _db.StockTransactions
            .Where(t => t.InventoryId == id)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();
        return Ok(txns.Select(t => new StockTransactionDto
        {
            Id = t.Id, InventoryId = t.InventoryId, ProductName = inv.ProductName,
            TransactionType = t.TransactionType, Quantity = t.Quantity,
            BalanceAfter = t.BalanceAfter, ReferenceId = t.ReferenceId,
            Description = t.Description, TransactionDate = t.TransactionDate
        }));
    }
}
