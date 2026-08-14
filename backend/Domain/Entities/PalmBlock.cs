namespace NgalaFarms.Domain.Entities;

public class PalmBlock : BaseEntity
{
    public string BlockId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int PlantationId { get; set; }
    public Plantation Plantation { get; set; } = null!;
    public decimal AreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? Notes { get; set; }
    public ICollection<PalmHarvest> Harvests { get; set; } = new List<PalmHarvest>();
}
