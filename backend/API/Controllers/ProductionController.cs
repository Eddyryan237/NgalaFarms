using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Domain.Entities;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/production")]
[Authorize]
public class ProductionController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;

    public ProductionController(NgalaFarmsDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var q = _db.Productions.AsQueryable();
        
        if (!string.IsNullOrEmpty(category))
            q = q.Where(p => p.Category == category);
        if (from.HasValue)
            q = q.Where(p => p.Date >= from);
        if (to.HasValue)
            q = q.Where(p => p.Date <= to);

        var list = await q.OrderByDescending(p => p.Date).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateProductionRequest req)
    {
        var production = new Production
        {
            Date = req.Date,
            Category = req.Category,
            Item = req.Item,
            Quantity = req.Quantity,
            Unit = req.Unit,
            Cost = req.Cost,
            Description = req.Description
        };

        _db.Productions.Add(production);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = production.Id }, production);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var production = await _db.Productions.FindAsync(id);
        return production == null ? NotFound() : Ok(production);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateProductionRequest req)
    {
        var production = await _db.Productions.FindAsync(id);
        if (production == null)
            return NotFound();

        production.Date = req.Date;
        production.Category = req.Category;
        production.Item = req.Item;
        production.Quantity = req.Quantity;
        production.Unit = req.Unit;
        production.Cost = req.Cost;
        production.Description = req.Description;

        await _db.SaveChangesAsync();
        return Ok(production);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var production = await _db.Productions.FindAsync(id);
        if (production == null)
            return NotFound();

        _db.Productions.Remove(production);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateProductionRequest
{
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public string? Description { get; set; }
}
