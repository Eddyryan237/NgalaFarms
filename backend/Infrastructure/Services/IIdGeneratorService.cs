namespace NgalaFarms.Infrastructure.Services;

public interface IIdGeneratorService
{
    Task<string> GenerateEmployeeIdAsync();
    Task<string> GenerateCattleIdAsync();
    Task<string> GenerateHarvestIdAsync();
    Task<string> GenerateProcessingIdAsync();
    Task<string> GenerateBatchIdAsync();
    Task<string> GenerateSaleInvoiceIdAsync();
    Task<string> GenerateExpenseIdAsync();
    Task<string> GenerateCustomerIdAsync();
    Task<string> GenerateSupplierIdAsync();
    Task<string> GeneratePlantationIdAsync();
    Task<string> GeneratePurchaseIdAsync();
    Task<string> GenerateCattleSaleIdAsync();
    Task<string> GenerateWeeklyReportIdAsync();
    Task<string> GeneratePayrollReceiptNumberAsync();
}
