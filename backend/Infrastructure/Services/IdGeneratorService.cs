using Microsoft.EntityFrameworkCore;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Services;

public class IdGeneratorService : IIdGeneratorService
{
    private readonly NgalaFarmsDbContext _context;
    public IdGeneratorService(NgalaFarmsDbContext context) => _context = context;

    public async Task<string> GenerateEmployeeIdAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _context.Employees.CountAsync() + 1;
        return $"EMP-{year}-{count:D4}";
    }

    public async Task<string> GenerateCattleIdAsync()
    {
        var count = await _context.Cattle.CountAsync() + 1;
        return $"COW-{count:D4}";
    }

    public async Task<string> GenerateSheepIdAsync()
    {
        var count = await _context.Sheep.CountAsync() + 1;
        return $"SHP-{count:D4}";
    }

    public async Task<string> GenerateHarvestIdAsync()
    {
        var count = await _context.PalmHarvests.CountAsync() + 1;
        return $"HAR-{count:D4}";
    }

    public async Task<string> GenerateProcessingIdAsync()
    {
        var count = await _context.PalmProcessings.CountAsync() + 1;
        return $"PROC-{count:D4}";
    }

    public async Task<string> GenerateBatchIdAsync()
    {
        var count = await _context.PalmOilBatches.CountAsync() + 1;
        return $"BATCH-{count:D4}";
    }

    public async Task<string> GenerateSaleInvoiceIdAsync()
    {
        var count = await _context.Sales.CountAsync() + 1;
        return $"INV-{count:D4}";
    }

    public async Task<string> GenerateExpenseIdAsync()
    {
        var count = await _context.Expenses.CountAsync() + 1;
        return $"EXP-{count:D4}";
    }

    public async Task<string> GenerateCustomerIdAsync()
    {
        var count = await _context.Customers.CountAsync() + 1;
        return $"CUST-{count:D4}";
    }

    public async Task<string> GenerateSupplierIdAsync()
    {
        var count = await _context.Suppliers.CountAsync() + 1;
        return $"SUPP-{count:D4}";
    }

    public async Task<string> GeneratePlantationIdAsync()
    {
        var count = await _context.Plantations.CountAsync() + 1;
        return $"PLT-{count:D4}";
    }

    public async Task<string> GeneratePurchaseIdAsync()
    {
        var count = await _context.CattlePurchases.CountAsync() + 1;
        return $"PUR-{count:D4}";
    }

    public async Task<string> GenerateCattleSaleIdAsync()
    {
        var count = await _context.CattleSales.CountAsync() + 1;
        return $"CSALE-{count:D4}";
    }

    public async Task<string> GenerateWeeklyReportIdAsync()
    {
        var count = await _context.WeeklyReports.CountAsync() + 1;
        return $"WR-{count:D4}";
    }
}
