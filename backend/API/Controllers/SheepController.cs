using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/sheep")]
[Authorize]
public class SheepController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    public SheepController(NgalaFarmsDbContext db, IIdGeneratorService ids) { _db = db; _ids = ids; }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok((await _db.Sheep.OrderBy(s => s.SheepId).ToListAsync()).Select(Map));

    [HttpPost]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Create(CreateSheepRequest req)
    {
        if (req.Sex is not ("Male" or "Female")) return BadRequest(new { message = "Sheep sex must be Male or Female." });
        var sheep = new Sheep { SheepId = await _ids.GenerateSheepIdAsync(), TagNumber = null, Sex = req.Sex, DateOfBirth = req.DateOfBirth, AcquisitionDate = req.AcquisitionDate, AcquisitionCost = req.AcquisitionCost, CurrentWeightKg = req.CurrentWeightKg, Location = req.Location, Remarks = req.Remarks };
        sheep.TagNumber = sheep.SheepId;
        _db.Sheep.Add(sheep);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = sheep.Id }, Map(sheep));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> Update(int id, CreateSheepRequest req)
    {
        var sheep = await _db.Sheep.FindAsync(id);
        if (sheep == null) return NotFound();
        if (req.Sex is not ("Male" or "Female")) return BadRequest(new { message = "Sheep sex must be Male or Female." });
        sheep.Sex = req.Sex; sheep.DateOfBirth = req.DateOfBirth; sheep.AcquisitionDate = req.AcquisitionDate; sheep.AcquisitionCost = req.AcquisitionCost; sheep.CurrentWeightKg = req.CurrentWeightKg; sheep.Location = req.Location; sheep.Remarks = req.Remarks;
        await _db.SaveChangesAsync();
        return Ok(Map(sheep));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var sheep = await _db.Sheep.FindAsync(id);
        if (sheep == null) return NotFound();
        _db.Sheep.Remove(sheep); await _db.SaveChangesAsync(); return NoContent();
    }

    private static SheepDto Map(Sheep s) => new() { Id = s.Id, SheepId = s.SheepId, TagNumber = s.TagNumber, Sex = s.Sex, DateOfBirth = s.DateOfBirth, AcquisitionDate = s.AcquisitionDate, AcquisitionCost = s.AcquisitionCost, CurrentWeightKg = s.CurrentWeightKg, Location = s.Location, Remarks = s.Remarks };
}
