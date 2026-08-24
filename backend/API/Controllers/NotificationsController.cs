using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    public NotificationsController(NgalaFarmsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? unreadOnly)
    {
        var q = _db.Notifications.AsQueryable();
        if (unreadOnly == true) q = q.Where(n => !n.IsRead);
        var list = await q.OrderByDescending(n => n.CreatedAt).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var n = await _db.Notifications.FindAsync(id);
        if (n == null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var list = await _db.Notifications.Where(n => !n.IsRead).ToListAsync();
        foreach (var n in list) n.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Delete(int id)
    {
        var n = await _db.Notifications.FindAsync(id);
        if (n == null) return NotFound();
        _db.Notifications.Remove(n);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static NotificationDto Map(Domain.Entities.Notification n) => new()
    {
        Id = n.Id, Title = n.Title, Message = n.Message, Category = n.Category,
        Priority = n.Priority, IsRead = n.IsRead, UserId = n.UserId,
        LinkUrl = n.LinkUrl, CreatedAt = n.CreatedAt
    };
}
