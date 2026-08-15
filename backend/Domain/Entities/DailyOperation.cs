namespace NgalaFarms.Domain.Entities;

public class DailyOperation : BaseEntity
{
    public DateTime Date { get; set; } = DateTime.UtcNow;
    // e.g. Clearing, Ringing, Pegging, Planting, Harvesting
    public string OperationType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    // Who performed the operation (user email or name)
    public string PerformedBy { get; set; } = string.Empty;
    // Optional plantation/block context
    public string? PlantationId { get; set; }
    public string? PalmBlockId { get; set; }
}
