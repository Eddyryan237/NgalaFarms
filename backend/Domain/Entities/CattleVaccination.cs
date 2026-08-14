namespace NgalaFarms.Domain.Entities;

public class CattleVaccination : BaseEntity
{
    public int CattleId { get; set; }
    public Cattle Cattle { get; set; } = null!;
    public string VaccineName { get; set; } = string.Empty;
    public DateTime VaccinationDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public string? AdministeredBy { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}
