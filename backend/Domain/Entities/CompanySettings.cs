namespace NgalaFarms.Domain.Entities;

public class CompanySettings : BaseEntity
{
    public string CompanyName { get; set; } = "Ngala Farms";
    public string? LogoPath { get; set; }
    public string? LogoUrl { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Description { get; set; }
    public string Currency { get; set; } = "XAF";
    public string? Website { get; set; }
}
