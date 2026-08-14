using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Plantation : BaseEntity
{
    public string PlantationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal TotalAreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? PalmVariety { get; set; }
    public PlantationStatus Status { get; set; } = PlantationStatus.Active;
    public string? Notes { get; set; }
    public ICollection<PalmBlock> Blocks { get; set; } = new List<PalmBlock>();
}
