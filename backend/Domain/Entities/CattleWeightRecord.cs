namespace NgalaFarms.Domain.Entities;

public class CattleWeightRecord : BaseEntity
{
    public int CattleId { get; set; }
    public Cattle Cattle { get; set; } = null!;
    public DateTime RecordDate { get; set; }
    public decimal WeightKg { get; set; }
    public string? Notes { get; set; }
}
