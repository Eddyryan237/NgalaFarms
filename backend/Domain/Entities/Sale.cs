using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Sale : BaseEntity
{
    public string InvoiceId { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Product { get; set; } = "Palm Oil";
    public decimal QuantityLitres { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;
    public DateTime SaleDate { get; set; }
    public string? Notes { get; set; }
}
