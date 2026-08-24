namespace NgalaFarms.Domain.Entities;

public class Sheep : BaseEntity
{
    public string SheepId { get; set; } = string.Empty;
    public string? TagNumber { get; set; }
    public string Sex { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public DateTime DateOfBirth { get; set; }
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public decimal? CurrentWeightKg { get; set; }
    public string? Location { get; set; }
    public string? Remarks { get; set; }
}
