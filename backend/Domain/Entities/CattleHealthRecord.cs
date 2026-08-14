namespace NgalaFarms.Domain.Entities;

public class CattleHealthRecord : BaseEntity
{
    public int CattleId { get; set; }
    public Cattle Cattle { get; set; } = null!;
    public DateTime RecordDate { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string? Treatment { get; set; }
    public string? Medication { get; set; }
    public decimal TreatmentCost { get; set; }
    public string? VeterinaryName { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? Notes { get; set; }
}
