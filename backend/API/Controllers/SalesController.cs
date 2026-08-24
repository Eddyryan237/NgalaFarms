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
        var list = await q.Where(s => !s.IsDeleted).OrderByDescending(s => s.SaleDate).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var s = await _db.Sales.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        return s == null ? NotFound() : Ok(Map(s));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest req)
    {
        if (req.CustomerId.HasValue)
        {
            var customerExists = await _db.Customers.AnyAsync(c => c.Id == req.CustomerId.Value && !c.IsDeleted);
            if (!customerExists)
            {
                return BadRequest(new { message = "Selected customer does not exist." });
            }
        }

        var totalPrice = req.QuantityLitres * req.UnitPrice;
        var s = new Sale
        {
            InvoiceId = await _ids.GenerateSaleInvoiceIdAsync(),
            CustomerId = req.CustomerId,
            CustomerName = req.CustomerName ?? "",
            CustomerPhone = req.CustomerPhone ?? string.Empty,
            CustomerEmail = req.CustomerEmail ?? string.Empty,
            CustomerAddress = req.CustomerAddress ?? string.Empty,
            CustomerType = req.CustomerType ?? "Customer",
            SellerName = req.SellerName ?? string.Empty,
            Product = req.Product,
            QuantityLitres = req.QuantityLitres,
            UnitPrice = req.UnitPrice,
            TotalPrice = totalPrice,
            PaymentMethod = req.PaymentMethod,
            PaymentStatus = req.PaymentStatus,
            SaleDate = req.SaleDate,
            Notes = req.Notes
        };
        _db.Sales.Add(s);

        var inv = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductName == "Palm Oil");
        if (inv != null)
        {
            inv.CurrentQuantity = Math.Max(0, inv.CurrentQuantity - req.QuantityLitres);
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryId = inv.Id,
                TransactionType = StockTransactionType.Sold,
                Quantity = req.QuantityLitres,
                BalanceAfter = inv.CurrentQuantity,
                ReferenceId = s.InvoiceId,
                Description = $"Sale {s.InvoiceId}",
                TransactionDate = req.SaleDate
            });
        }

        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, $"Recorded palm oil sale {s.InvoiceId}", "Sale", s.InvoiceId);
        return CreatedAtAction(nameof(Get), new { id = s.Id }, Map(s));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateSaleRequest req)
    {
        var s = await _db.Sales.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (s == null) return NotFound();

        if (req.CustomerId.HasValue)
        {
            var customerExists = await _db.Customers.AnyAsync(c => c.Id == req.CustomerId.Value && !c.IsDeleted);
            if (!customerExists)
            {
                return BadRequest(new { message = "Selected customer does not exist." });
            }
        }

        s.CustomerId = req.CustomerId;
        s.CustomerName = req.CustomerName ?? "";
        s.CustomerPhone = req.CustomerPhone ?? string.Empty;
        s.CustomerEmail = req.CustomerEmail ?? string.Empty;
        s.CustomerAddress = req.CustomerAddress ?? string.Empty;
        s.CustomerType = req.CustomerType ?? "Customer";
        s.SellerName = req.SellerName ?? string.Empty;
        s.Product = req.Product;
        s.QuantityLitres = req.QuantityLitres;
        s.UnitPrice = req.UnitPrice;
        s.TotalPrice = req.QuantityLitres * req.UnitPrice;
        s.PaymentMethod = req.PaymentMethod;
        s.PaymentStatus = req.PaymentStatus;
        s.SaleDate = req.SaleDate;
        s.Notes = req.Notes;

        await _db.SaveChangesAsync();
        return Ok(Map(s));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Sales.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (s == null) return NotFound();
        _db.Sales.Remove(s); await _db.SaveChangesAsync();
        return NoContent();
    }

    private static SaleDto Map(Sale s) => new()
    {
        Id = s.Id,
        InvoiceId = s.InvoiceId,
        CustomerId = s.CustomerId,
        CustomerName = s.CustomerName,
        CustomerPhone = s.CustomerPhone,
        CustomerEmail = s.CustomerEmail,
        CustomerAddress = s.CustomerAddress,
        CustomerType = s.CustomerType,
        SellerName = s.SellerName,
        Product = s.Product,
        QuantityLitres = s.QuantityLitres,
        UnitPrice = s.UnitPrice,
        TotalPrice = s.TotalPrice,
        PaymentMethod = s.PaymentMethod,
        PaymentStatus = s.PaymentStatus,
        SaleDate = s.SaleDate,
        Notes = s.Notes,
        CreatedAt = s.CreatedAt
    };
}
