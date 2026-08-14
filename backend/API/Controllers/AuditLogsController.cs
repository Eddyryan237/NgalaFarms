using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = "Founder")]
public class AuditLogsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    public AuditLogsController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var total = await _db.AuditLogs.CountAsync();
        var list = await _db.AuditLogs
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return Ok(new { total, page, pageSize, data = list.Select(l => new AuditLogDto { Id = l.Id, UserId = l.UserId, UserName = l.UserName, Action = l.Action, EntityType = l.EntityType, EntityId = l.EntityId, PreviousValues = l.PreviousValues, NewValues = l.NewValues, IpAddress = l.IpAddress, Timestamp = l.Timestamp }) });
    }
}
