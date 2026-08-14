using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Notification : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationCategory Category { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Medium;
    public bool IsRead { get; set; } = false;
    public string? UserId { get; set; }
    public string? LinkUrl { get; set; }
}
