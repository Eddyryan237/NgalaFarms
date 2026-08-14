using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class CattleSale : BaseEntity
{
    public string SaleId { get; set; } = string.Empty;
    public int CattleId { get; set; }
    public Cattle Cattle { get; set; } = null!;
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal SalePrice { get; set; }
    public decimal WeightAtSaleKg { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;
    public string? Notes { get; set; }
}
