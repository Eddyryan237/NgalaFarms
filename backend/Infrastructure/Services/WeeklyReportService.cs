using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Domain.Enums;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Services;

public interface IWeeklyReportService
{
    Task<WeeklyReportDto> GenerateWeeklyReportAsync(DateTime weekStart);
    Task<List<WeeklyReportDto>> GetAllReportsAsync();
    Task<WeeklyReportDto?> GetReportByIdAsync(int id);
}

public class WeeklyReportService : IWeeklyReportService
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IIdGeneratorService _ids;
    public WeeklyReportService(NgalaFarmsDbContext db, IIdGeneratorService ids) { _db = db; _ids = ids; }

    public async Task<WeeklyReportDto> GenerateWeeklyReportAsync(DateTime weekStart)
    {
        var start = weekStart.Date;
        var end = start.AddDays(7);

        var fruitKg = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= start && h.HarvestDate < end).SumAsync(h => h.TotalWeightKg);
        var oilLitres = await _db.PalmProcessings.Where(p => p.ProcessingDate >= start && p.ProcessingDate < end).SumAsync(p => p.PalmOilLitres);
        var oilSold = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate < end).SumAsync(s => s.QuantityLitres);
        var palmRev = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate < end).SumAsync(s => s.TotalPrice);
        var palmProdCost = await _db.PalmProcessings.Where(p => p.ProcessingDate >= start && p.ProcessingDate < end).SumAsync(p => p.ProcessingCost + p.LaborCost + p.FuelCost);
        var oilStock = await _db.Inventories.Where(i => i.ProductName == "Palm Oil").SumAsync(i => i.CurrentQuantity);
        var yield = fruitKg > 0 ? Math.Round(oilLitres / fruitKg * 100, 2) : 0;

        var totalCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active);
        var newCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.AcquisitionDate >= start && c.AcquisitionDate < end);
        var soldCattle = await _db.CattleSales.CountAsync(s => s.SaleDate >= start && s.SaleDate < end);
        var feedExp = await _db.CattleFeedings.Where(f => f.FeedingDate >= start && f.FeedingDate < end).SumAsync(f => f.Cost);
        var vetExp = await _db.CattleHealthRecords.Where(h => !h.IsDeleted && h.RecordDate >= start && h.RecordDate < end).SumAsync(h => h.TreatmentCost);
        var avgWeight = totalCattle > 0 ? await _db.Cattle.Where(c => !c.IsDeleted && c.Status == CattleStatus.Active).AverageAsync(c => c.CurrentWeightKg ?? 0) : 0;
        var healthAlerts = await _db.CattleHealthRecords.CountAsync(h => !h.IsDeleted && h.FollowUpDate >= start);

        var totalExp = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= start && e.Date < end).SumAsync(e => e.Amount);
        var salaryExp = await _db.Salaries.Where(s => s.Status == SalaryStatus.Paid && s.PeriodStart >= start && s.PeriodStart < end).SumAsync(s => s.Amount);
        var cattleRev = await _db.CattleSales.Where(s => s.SaleDate >= start && s.SaleDate < end).SumAsync(s => s.SalePrice);
        var totalRevenue = palmRev + cattleRev;
        var totalExpenses = totalExp + salaryExp;
        var netProfit = totalRevenue - totalExpenses;

        var reportId = await _ids.GenerateWeeklyReportIdAsync();
        var report = new WeeklyReport
        {
            ReportId = reportId,
            WeekStart = start,
            WeekEnd = end.AddDays(-1),
            WeekLabel = $"{start:MMM d} – {end.AddDays(-1):MMM d, yyyy}",
            PalmFruitHarvestedKg = fruitKg,
            PalmOilProducedLitres = oilLitres,
            PalmOilSoldLitres = oilSold,
            PalmOilRemainingLitres = oilStock,
            PalmProductionCost = palmProdCost,
            PalmSalesRevenue = palmRev,
            PalmYieldPercentage = yield,
            TotalCattle = totalCattle,
            NewCattle = newCattle,
            CattleSold = soldCattle,
            FeedingExpenses = feedExp,
            VeterinaryExpenses = vetExp,
            AverageWeightKg = Math.Round(avgWeight, 1),
            HealthAlerts = healthAlerts,
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            SalaryExpenses = salaryExp,
            NetProfit = netProfit,
            ProfitMarginPercent = totalRevenue > 0 ? Math.Round(netProfit / totalRevenue * 100, 1) : 0,
            IsGenerated = true,
            GeneratedAt = DateTime.UtcNow
        };
        _db.WeeklyReports.Add(report);
        await _db.SaveChangesAsync();
        return MapToDto(report);
    }

    public async Task<List<WeeklyReportDto>> GetAllReportsAsync()
    {
        var reports = await _db.WeeklyReports.OrderByDescending(r => r.WeekStart).ToListAsync();
        return reports.Select(MapToDto).ToList();
    }

    public async Task<WeeklyReportDto?> GetReportByIdAsync(int id)
    {
        var r = await _db.WeeklyReports.FindAsync(id);
        return r == null ? null : MapToDto(r);
    }

    private static WeeklyReportDto MapToDto(WeeklyReport r) => new()
    {
        Id = r.Id,
        ReportId = r.ReportId,
        WeekStart = r.WeekStart,
        WeekEnd = r.WeekEnd,
        WeekLabel = r.WeekLabel,
        PalmFruitHarvestedKg = r.PalmFruitHarvestedKg,
        PalmOilProducedLitres = r.PalmOilProducedLitres,
        PalmOilSoldLitres = r.PalmOilSoldLitres,
        PalmOilRemainingLitres = r.PalmOilRemainingLitres,
        PalmProductionCost = r.PalmProductionCost,
        PalmSalesRevenue = r.PalmSalesRevenue,
        PalmYieldPercentage = r.PalmYieldPercentage,
        TotalCattle = r.TotalCattle,
        NewCattle = r.NewCattle,
        CattleSold = r.CattleSold,
        FeedingExpenses = r.FeedingExpenses,
        VeterinaryExpenses = r.VeterinaryExpenses,
        AverageWeightKg = r.AverageWeightKg,
        HealthAlerts = r.HealthAlerts,
        TotalRevenue = r.TotalRevenue,
        TotalExpenses = r.TotalExpenses,
        SalaryExpenses = r.SalaryExpenses,
        NetProfit = r.NetProfit,
        ProfitMarginPercent = r.ProfitMarginPercent,
        GeneratedAt = r.GeneratedAt
    };
}
