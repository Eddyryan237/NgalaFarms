using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly NgalaFarmsDbContext _context;
    public AuditService(NgalaFarmsDbContext context) => _context = context;

    public async Task LogAsync(string userId, string userName, string action, string entityType, string? entityId = null, string? previousValues = null, string? newValues = null, string? ipAddress = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            UserName = userName,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            PreviousValues = previousValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
