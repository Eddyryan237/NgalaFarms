using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public string InvoiceId { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Customer";
    public string SellerName { get; set; } = string.Empty;
    public string Product { get; set; } = string.Empty;
    public decimal QuantityLitres { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime SaleDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSaleRequest
{
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Customer";
    public string SellerName { get; set; } = string.Empty;
    public string Product { get; set; } = "Palm Oil";
    public decimal QuantityLitres { get; set; }
    public decimal UnitPrice { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;
    public DateTime SaleDate { get; set; }
    public string? Notes { get; set; }
}
