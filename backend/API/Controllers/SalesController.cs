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
[Route("api/sales")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public SalesController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var q = _db.Sales.AsQueryable();
        if (from.HasValue) q = q.Where(s => s.SaleDate >= from);
        if (to.HasValue) q = q.Where(s => s.SaleDate <= to);
        var list = await q.OrderByDescending(s => s.SaleDate).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var s = await _db.Sales.FindAsync(id);
        return s == null ? NotFound() : Ok(Map(s));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest req)
    {
        var totalPrice = req.QuantityLitres * req.UnitPrice;
        var s = new Sale
        {
            InvoiceId = await _ids.GenerateSaleInvoiceIdAsync(),
            CustomerId = req.CustomerId, CustomerName = req.CustomerName,
            Product = req.Product, QuantityLitres = req.QuantityLitres,
            UnitPrice = req.UnitPrice, TotalPrice = totalPrice,
            PaymentMethod = req.PaymentMethod, PaymentStatus = req.PaymentStatus,
            SaleDate = req.SaleDate, Notes = req.Notes
        };
        _db.Sales.Add(s);

        // Decrease palm oil inventory
        var inv = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductName == "Palm Oil");
        if (inv != null)
        {
            inv.CurrentQuantity = Math.Max(0, inv.CurrentQuantity - req.QuantityLitres);
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryId = inv.Id, TransactionType = StockTransactionType.Sold,
                Quantity = req.QuantityLitres, BalanceAfter = inv.CurrentQuantity,
                ReferenceId = s.InvoiceId, Description = $"Sale {s.InvoiceId}",
                TransactionDate = req.SaleDate
            });
        }

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded palm oil sale {s.InvoiceId}", "Sale", s.InvoiceId);
        return CreatedAtAction(nameof(Get), new { id = s.Id }, Map(s));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Sales.FindAsync(id);
        if (s == null) return NotFound();
        s.IsDeleted = true; await _db.SaveChangesAsync();
        return NoContent();
    }

    private static SaleDto Map(Sale s) => new()
    {
        Id = s.Id, InvoiceId = s.InvoiceId, CustomerId = s.CustomerId,
        CustomerName = s.CustomerName, Product = s.Product,
        QuantityLitres = s.QuantityLitres, UnitPrice = s.UnitPrice, TotalPrice = s.TotalPrice,
        PaymentMethod = s.PaymentMethod, PaymentStatus = s.PaymentStatus,
        SaleDate = s.SaleDate, Notes = s.Notes, CreatedAt = s.CreatedAt
    };
}
