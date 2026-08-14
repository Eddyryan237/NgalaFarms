using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Cattle : BaseEntity
{
    public string CattleId { get; set; } = string.Empty;
    public string? TagNumber { get; set; }
    public string? Name { get; set; }
    public CattleSex Sex { get; set; }
    public string Breed { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public CattleStatus Status { get; set; } = CattleStatus.Active;
    public decimal CurrentWeightKg { get; set; }
    public string? ParentInfo { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public ICollection<CattleHealthRecord> HealthRecords { get; set; } = new List<CattleHealthRecord>();
    public ICollection<CattleVaccination> Vaccinations { get; set; } = new List<CattleVaccination>();
    public ICollection<CattleFeeding> FeedingRecords { get; set; } = new List<CattleFeeding>();
    public ICollection<CattleWeightRecord> WeightRecords { get; set; } = new List<CattleWeightRecord>();
}
