using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class StockTransaction : BaseEntity
{
    public int InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;
    public StockTransactionType TransactionType { get; set; }
    public decimal Quantity { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceId { get; set; }
    public string? Description { get; set; }
    public DateTime TransactionDate { get; set; }
}
