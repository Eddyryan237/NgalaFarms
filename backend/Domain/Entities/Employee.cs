using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Employee : BaseEntity
{
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal MonthlySalary { get; set; }
    public DateTime EmploymentDate { get; set; }
    public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? Notes { get; set; }
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
