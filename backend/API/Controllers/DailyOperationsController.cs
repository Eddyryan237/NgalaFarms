using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/daily-operations")]
public class DailyOperationsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;

    public DailyOperationsController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> GetAll()
    {
        var ops = await _db.DailyOperations.OrderByDescending(o => o.Date).ToListAsync();
        return Ok(ops);
    }

    [HttpPost]
    [Authorize(Roles = "Manager,Founder")]
    public async Task<IActionResult> Create([FromBody] DailyOperation op)
    {
        if (op == null) return BadRequest();
        op.PerformedBy = User?.Identity?.Name ?? op.PerformedBy;
        _db.DailyOperations.Add(op);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = op.Id }, op);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Manager,Founder")]
    public async Task<IActionResult> Update(int id, [FromBody] DailyOperation updatedOp)
    {
        if (updatedOp == null) return BadRequest();

        var op = await _db.DailyOperations.FindAsync(id);
        if (op == null) return NotFound();

        op.OperationType = updatedOp.OperationType;
        op.Description = updatedOp.Description ?? op.Description;
        op.Date = updatedOp.Date;
        op.PlantationId = updatedOp.PlantationId;
        op.PalmBlockId = updatedOp.PalmBlockId;

        if (!string.IsNullOrWhiteSpace(updatedOp.PerformedBy))
            op.PerformedBy = updatedOp.PerformedBy;

        await _db.SaveChangesAsync();
        return Ok(op);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager,Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var op = await _db.DailyOperations.FindAsync(id);
        if (op == null) return NotFound();
        
        _db.DailyOperations.Remove(op);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Operation deleted successfully" });
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> GetById(int id)
    {
        var op = await _db.DailyOperations.FindAsync(id);
        if (op == null) return NotFound();
        return Ok(op);
    }
}
