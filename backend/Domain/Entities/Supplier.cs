namespace NgalaFarms.Domain.Entities;

public class Supplier : BaseEntity
{
    public string SupplierId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? ProductsServices { get; set; }
    public decimal OutstandingBalance { get; set; } = 0;
    public string? Notes { get; set; }
    public ICollection<CattlePurchase> CattlePurchases { get; set; } = new List<CattlePurchase>();
}
