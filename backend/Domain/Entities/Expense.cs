using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Domain.Entities;

public class Expense : BaseEntity
{
    public string ExpenseId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public ExpenseDivision Division { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string? ReceiptPath { get; set; }
    public string? Notes { get; set; }
}
