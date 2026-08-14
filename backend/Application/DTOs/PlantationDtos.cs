using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class PlantationDto
{
    public int Id { get; set; }
    public string PlantationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal TotalAreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? PalmVariety { get; set; }
    public PlantationStatus Status { get; set; }
    public string? Notes { get; set; }
    public int BlockCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePlantationRequest
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal TotalAreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? PalmVariety { get; set; }
    public PlantationStatus Status { get; set; } = PlantationStatus.Active;
    public string? Notes { get; set; }
}

public class PalmBlockDto
{
    public int Id { get; set; }
    public string BlockId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int PlantationId { get; set; }
    public string PlantationName { get; set; } = string.Empty;
    public decimal AreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? Notes { get; set; }
}

public class CreatePalmBlockRequest
{
    public string Name { get; set; } = string.Empty;
    public int PlantationId { get; set; }
    public decimal AreaHectares { get; set; }
    public int NumberOfTrees { get; set; }
    public DateTime PlantingDate { get; set; }
    public string? Notes { get; set; }
}
