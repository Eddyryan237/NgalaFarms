using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationCategory Category { get; set; }
    public NotificationPriority Priority { get; set; }
    public bool IsRead { get; set; }
    public string? UserId { get; set; }
    public string? LinkUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
