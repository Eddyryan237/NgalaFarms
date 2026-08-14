namespace NgalaFarms.Domain.Entities;

public class CattleFeeding : BaseEntity
{
    public int? CattleId { get; set; }
    public Cattle? Cattle { get; set; }
    public string? GroupName { get; set; }
    public DateTime FeedingDate { get; set; }
    public string FeedType { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}
