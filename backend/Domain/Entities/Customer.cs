namespace NgalaFarms.Domain.Entities;

public class Customer : BaseEntity
{
    public string CustomerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? CustomerType { get; set; }
    public decimal OutstandingBalance { get; set; } = 0;
    public string? Notes { get; set; }
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<CattleSale> CattleSales { get; set; } = new List<CattleSale>();
}
