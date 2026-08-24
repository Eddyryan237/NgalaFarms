using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    public CustomersController(NgalaFarmsDbContext db, IIdGeneratorService ids) { _db = db; _ids = ids; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Customers.OrderBy(c => c.Name).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Customers.FindAsync(id);
        return c == null ? NotFound() : Ok(Map(c));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest req)
    {
        var c = new Customer { CustomerId = await _ids.GenerateCustomerIdAsync(), Name = req.Name, Phone = req.Phone, Email = req.Email, Address = req.Address, CustomerType = req.CustomerType, Notes = req.Notes };
        _db.Customers.Add(c);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = c.Id }, Map(c));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCustomerRequest req)
    {
        var c = await _db.Customers.FindAsync(id);
        if (c == null) return NotFound();
        c.Name = req.Name; c.Phone = req.Phone; c.Email = req.Email; c.Address = req.Address; c.CustomerType = req.CustomerType; c.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Customers.FindAsync(id);
        if (c == null) return NotFound();
        _db.Customers.Remove(c); await _db.SaveChangesAsync();
        return NoContent();
    }

    private static CustomerDto Map(Customer c) => new() { Id = c.Id, CustomerId = c.CustomerId, Name = c.Name, Phone = c.Phone, Email = c.Email, Address = c.Address, CustomerType = c.CustomerType, OutstandingBalance = c.OutstandingBalance, Notes = c.Notes, CreatedAt = c.CreatedAt };
}

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    public SuppliersController(NgalaFarmsDbContext db, IIdGeneratorService ids) { _db = db; _ids = ids; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Suppliers.OrderBy(s => s.Name).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateSupplierRequest req)
    {
        var s = new Supplier { SupplierId = await _ids.GenerateSupplierIdAsync(), Name = req.Name, ContactPerson = req.ContactPerson, Phone = req.Phone, Email = req.Email, Address = req.Address, ProductsServices = req.ProductsServices, Notes = req.Notes };
        _db.Suppliers.Add(s);
        await _db.SaveChangesAsync();
        return Ok(Map(s));
    }

    private static SupplierDto Map(Supplier s) => new() { Id = s.Id, SupplierId = s.SupplierId, Name = s.Name, ContactPerson = s.ContactPerson, Phone = s.Phone, Email = s.Email, Address = s.Address, ProductsServices = s.ProductsServices, OutstandingBalance = s.OutstandingBalance, Notes = s.Notes, CreatedAt = s.CreatedAt };
}
