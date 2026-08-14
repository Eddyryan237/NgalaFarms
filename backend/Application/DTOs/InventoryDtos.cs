using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class InventoryDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CurrentQuantity { get; set; }
    public decimal MinimumQuantity { get; set; }
    public string? StorageLocation { get; set; }
    public bool IsLowStock { get; set; }
    public string? Notes { get; set; }
}

public class StockTransactionDto
{
    public int Id { get; set; }
    public int InventoryId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public StockTransactionType TransactionType { get; set; }
    public decimal Quantity { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceId { get; set; }
    public string? Description { get; set; }
    public DateTime TransactionDate { get; set; }
}
