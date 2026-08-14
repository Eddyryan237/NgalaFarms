using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public string ExpenseId { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public ExpenseDivision Division { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseRequest
{
    public string Category { get; set; } = string.Empty;
    public ExpenseDivision Division { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public int? EmployeeId { get; set; }
    public string? Notes { get; set; }
}
