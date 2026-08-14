namespace NgalaFarms.Domain.Entities;

public class PalmHarvest : BaseEntity
{
    public string HarvestId { get; set; } = string.Empty;
    public int PlantationId { get; set; }
    public Plantation Plantation { get; set; } = null!;
    public int? PalmBlockId { get; set; }
    public PalmBlock? PalmBlock { get; set; }
    public DateTime HarvestDate { get; set; }
    public int NumberOfBunches { get; set; }
    public decimal TotalWeightKg { get; set; }
    public string? HarvestTeam { get; set; }
    public decimal LaborCost { get; set; }
    public string? Notes { get; set; }
    public bool IsProcessed { get; set; } = false;
}
