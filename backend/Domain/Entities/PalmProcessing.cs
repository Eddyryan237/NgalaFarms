namespace NgalaFarms.Domain.Entities;

public class PalmProcessing : BaseEntity
{
    public string ProcessingId { get; set; } = string.Empty;
    public DateTime ProcessingDate { get; set; }
    public decimal RawFruitKg { get; set; }
    public decimal PalmOilLitres { get; set; }
    public decimal ProcessingCost { get; set; }
    public decimal LaborCost { get; set; }
    public decimal FuelCost { get; set; }
    public decimal WasteKg { get; set; }
    public decimal YieldPercentage { get; set; } // calculated
    public string? Notes { get; set; }
    public ICollection<PalmOilBatch> Batches { get; set; } = new List<PalmOilBatch>();
}
