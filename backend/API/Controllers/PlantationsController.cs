using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/plantations")]
[Authorize]
public class PlantationsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    private readonly IAuditService _audit;
    public PlantationsController(NgalaFarmsDbContext db, IIdGeneratorService ids, IAuditService audit)
    { _db = db; _ids = ids; _audit = audit; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Plantations.Include(p => p.Blocks).OrderBy(p => p.Name).ToListAsync();
        return Ok(list.Select(p => new PlantationDto
        {
            Id = p.Id,
            PlantationId = p.PlantationId,
            Name = p.Name,
            Location = p.Location,
            TotalAreaHectares = p.TotalAreaHectares,
            NumberOfTrees = p.NumberOfTrees,
            PlantingDate = p.PlantingDate,
            PalmVariety = p.PalmVariety,
            Status = p.Status,
            Notes = p.Notes,
            BlockCount = p.Blocks.Count(b => !b.IsDeleted),
            CreatedAt = p.CreatedAt
        }));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await _db.Plantations.Include(x => x.Blocks).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        return Ok(new PlantationDto { Id = p.Id, PlantationId = p.PlantationId, Name = p.Name, Location = p.Location, TotalAreaHectares = p.TotalAreaHectares, NumberOfTrees = p.NumberOfTrees, PlantingDate = p.PlantingDate, PalmVariety = p.PalmVariety, Status = p.Status, Notes = p.Notes, BlockCount = p.Blocks.Count(b => !b.IsDeleted), CreatedAt = p.CreatedAt });
    }

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create([FromBody] CreatePlantationRequest req)
    {
        var p = new Plantation { PlantationId = await _ids.GeneratePlantationIdAsync(), Name = req.Name, Location = req.Location, TotalAreaHectares = req.TotalAreaHectares, NumberOfTrees = req.NumberOfTrees, PlantingDate = req.PlantingDate, PalmVariety = req.PalmVariety, Status = req.Status, Notes = req.Notes };
        _db.Plantations.Add(p);
        await _db.SaveChangesAsync();
        var userId = User.FindFirst("userId")?.Value ?? "";
        var userName = User.FindFirst("fullName")?.Value ?? "";
        await _audit.LogAsync(userId, userName, "Created plantation", "Plantation", p.PlantationId);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, p);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePlantationRequest req)
    {
        var p = await _db.Plantations.FindAsync(id);
        if (p == null) return NotFound();
        p.Name = req.Name; p.Location = req.Location; p.TotalAreaHectares = req.TotalAreaHectares;
        p.NumberOfTrees = req.NumberOfTrees; p.PlantingDate = req.PlantingDate; p.PalmVariety = req.PalmVariety;
        p.Status = req.Status; p.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Plantations.FindAsync(id);
        if (p == null) return NotFound();
        _db.Plantations.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Palm Blocks
    [HttpGet("{plantationId:int}/blocks")]
    public async Task<IActionResult> GetBlocks(int plantationId)
    {
        var plantation = await _db.Plantations.FindAsync(plantationId);
        var blocks = await _db.PalmBlocks.Where(b => !b.IsDeleted && b.PlantationId == plantationId).Include(b => b.Plantation).ToListAsync();
        return Ok(blocks.Select(b => new PalmBlockDto { Id = b.Id, BlockId = b.BlockId, Name = b.Name, PlantationId = b.PlantationId, PlantationName = plantation?.Name ?? "", AreaHectares = b.AreaHectares, NumberOfTrees = b.NumberOfTrees, PlantingDate = b.PlantingDate, Notes = b.Notes }));
    }

    [HttpPost("{plantationId:int}/blocks")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> CreateBlock(int plantationId, [FromBody] CreatePalmBlockRequest req)
    {
        var count = await _db.PalmBlocks.CountAsync(b => b.PlantationId == plantationId) + 1;
        var b = new PalmBlock { BlockId = $"BLK-{plantationId}-{count:D2}", Name = req.Name, PlantationId = plantationId, AreaHectares = req.AreaHectares, NumberOfTrees = req.NumberOfTrees, PlantingDate = req.PlantingDate, Notes = req.Notes };
        _db.PalmBlocks.Add(b);
        await _db.SaveChangesAsync();
        return Ok(b);
    }
}
