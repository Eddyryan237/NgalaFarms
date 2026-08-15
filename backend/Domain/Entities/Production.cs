namespace NgalaFarms.Domain.Entities;

public class Production : BaseEntity
{
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public string? Description { get; set; }
}
