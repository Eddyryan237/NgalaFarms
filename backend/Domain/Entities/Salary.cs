using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Salary : BaseEntity
{
    public string ReceiptNumber { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Period { get; set; } = string.Empty; // e.g. "August 2026"
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public DateTime? PaymentDate { get; set; }
    public SalaryStatus Status { get; set; } = SalaryStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? Notes { get; set; }
}
