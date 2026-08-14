namespace NgalaFarms.Application.DTOs;

public class PalmHarvestDto
{
    public int Id { get; set; }
    public string HarvestId { get; set; } = string.Empty;
    public int PlantationId { get; set; }
    public string PlantationName { get; set; } = string.Empty;
    public int? PalmBlockId { get; set; }
    public string? BlockName { get; set; }
    public DateTime HarvestDate { get; set; }
    public int NumberOfBunches { get; set; }
    public decimal TotalWeightKg { get; set; }
    public string? HarvestTeam { get; set; }
    public decimal LaborCost { get; set; }
    public string? Notes { get; set; }
    public bool IsProcessed { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePalmHarvestRequest
{
    public int PlantationId { get; set; }
    public int? PalmBlockId { get; set; }
    public DateTime HarvestDate { get; set; }
    public int NumberOfBunches { get; set; }
    public decimal TotalWeightKg { get; set; }
    public string? HarvestTeam { get; set; }
    public decimal LaborCost { get; set; }
    public string? Notes { get; set; }
}

public class PalmProcessingDto
{
    public int Id { get; set; }
    public string ProcessingId { get; set; } = string.Empty;
    public DateTime ProcessingDate { get; set; }
    public decimal RawFruitKg { get; set; }
    public decimal PalmOilLitres { get; set; }
    public decimal ProcessingCost { get; set; }
    public decimal LaborCost { get; set; }
    public decimal FuelCost { get; set; }
    public decimal WasteKg { get; set; }
    public decimal YieldPercentage { get; set; }
    public decimal TotalCost { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePalmProcessingRequest
{
    public DateTime ProcessingDate { get; set; }
    public decimal RawFruitKg { get; set; }
    public decimal PalmOilLitres { get; set; }
    public decimal ProcessingCost { get; set; }
    public decimal LaborCost { get; set; }
    public decimal FuelCost { get; set; }
    public decimal WasteKg { get; set; }
    public string? StorageLocation { get; set; }
    public string? Notes { get; set; }
}
