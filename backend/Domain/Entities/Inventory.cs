namespace NgalaFarms.Domain.Entities;

public class Inventory : BaseEntity
{
    public string ProductName { get; set; } = string.Empty; // "Palm Fruit" or "Palm Oil"
    public string Unit { get; set; } = string.Empty; // KG or Litres
    public decimal CurrentQuantity { get; set; }
    public decimal MinimumQuantity { get; set; } = 0;
    public string? StorageLocation { get; set; }
    public string? Notes { get; set; }
    public ICollection<StockTransaction> Transactions { get; set; } = new List<StockTransaction>();
}
