namespace NgalaFarms.Domain.Entities;

public class PalmOilBatch : BaseEntity
{
    public string BatchId { get; set; } = string.Empty;
    public int ProcessingId { get; set; }
    public PalmProcessing Processing { get; set; } = null!;
    public DateTime ProductionDate { get; set; }
    public decimal QuantityLitres { get; set; }
    public decimal RemainingLitres { get; set; }
    public string? StorageLocation { get; set; }
    public string? Notes { get; set; }
}
