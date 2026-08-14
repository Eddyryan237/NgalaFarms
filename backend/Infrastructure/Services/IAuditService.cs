namespace NgalaFarms.Infrastructure.Services;

public interface IAuditService
{
    Task LogAsync(string userId, string userName, string action, string entityType, string? entityId = null, string? previousValues = null, string? newValues = null, string? ipAddress = null);
}
