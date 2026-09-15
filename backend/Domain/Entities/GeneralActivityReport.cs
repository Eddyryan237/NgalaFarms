namespace NgalaFarms.Domain.Entities;

public class GeneralActivityReport : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Report { get; set; } = string.Empty;
    public DateTime ReportDate { get; set; } = DateTime.UtcNow.Date;
    public string SubmittedBy { get; set; } = string.Empty;
}