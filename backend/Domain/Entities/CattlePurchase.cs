using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class CattlePurchase : BaseEntity
{
    public string PurchaseId { get; set; } = string.Empty;
    public int CattleId { get; set; }
    public Cattle Cattle { get; set; } = null!;
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal WeightAtPurchaseKg { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;
    public string? Notes { get; set; }
}
