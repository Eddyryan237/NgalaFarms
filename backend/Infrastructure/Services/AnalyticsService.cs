using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Enums;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Services;

public interface IAnalyticsService
{
    Task<CompanyAnalyticsDto> GetCompanyAnalyticsAsync(DateTime? from, DateTime? to);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly NgalaFarmsDbContext _db;
    public AnalyticsService(NgalaFarmsDbContext db) => _db = db;

    public async Task<CompanyAnalyticsDto> GetCompanyAnalyticsAsync(DateTime? from, DateTime? to)
    {
        var start = from ?? new DateTime(DateTime.UtcNow.Year, 1, 1);
        var end = to ?? DateTime.UtcNow.AddDays(1);

        var palmRev = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate <= end).SumAsync(s => s.TotalPrice);
        var cattleRev = await _db.CattleSales.Where(s => s.SaleDate >= start && s.SaleDate <= end).SumAsync(s => s.SalePrice);
        var totalRevenue = palmRev + cattleRev;

        var palmExp = await _db.Expenses.Where(e => !e.IsDeleted && e.Division == ExpenseDivision.PalmOil && e.Date >= start && e.Date <= end).SumAsync(e => e.Amount);
        var cattleExp = await _db.Expenses.Where(e => !e.IsDeleted && e.Division == ExpenseDivision.Cattle && e.Date >= start && e.Date <= end).SumAsync(e => e.Amount);
        var genExp = await _db.Expenses.Where(e => !e.IsDeleted && e.Division == ExpenseDivision.General && e.SalaryId == null && e.Date >= start && e.Date <= end).SumAsync(e => e.Amount);
        var salaryExp = await _db.Salaries.Where(s => s.Status == SalaryStatus.Paid && s.PeriodStart >= start && s.PeriodStart <= end).SumAsync(s => s.Amount);
        var totalExpenses = palmExp + cattleExp + genExp + salaryExp;
        var netProfit = totalRevenue - totalExpenses;

        // Palm analytics
        var fruitKg = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= start && h.HarvestDate <= end).SumAsync(h => h.TotalWeightKg);
        var oilLitres = await _db.PalmProcessings.Where(p => !p.IsDeleted && p.ProcessingDate >= start && p.ProcessingDate <= end).SumAsync(p => p.PalmOilLitres)
                   + await _db.Productions.Where(p => p.Category == "Palm Oil" && new[] { "l", "litre", "litres", "liter", "liters" }.Contains(p.Unit.ToLower()) && p.Date >= start && p.Date <= end).SumAsync(p => p.Quantity);
        var oilSold = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= start && s.SaleDate <= end).SumAsync(s => s.QuantityLitres);
        var oilProducedAll = await _db.PalmProcessings.Where(p => !p.IsDeleted).SumAsync(p => p.PalmOilLitres)
                   + await _db.Productions.Where(p => p.Category == "Palm Oil" && new[] { "l", "litre", "litres", "liter", "liters" }.Contains(p.Unit.ToLower())).SumAsync(p => p.Quantity);
        var oilSoldAll = await _db.Sales.Where(s => !s.IsDeleted).SumAsync(s => s.QuantityLitres);
        var oilStock = Math.Max(0, oilProducedAll - oilSoldAll);
        var palmProdCost = await _db.PalmProcessings.Where(p => p.ProcessingDate >= start && p.ProcessingDate <= end).SumAsync(p => p.ProcessingCost + p.LaborCost + p.FuelCost);
        var avgYield = fruitKg > 0 ? (oilLitres / fruitKg) * 100 : 0;

        // Harvest trend – monthly
        var harvestTrend = new List<HarvestTrendDto>();
        for (int i = 5; i >= 0; i--)
        {
            var md = DateTime.UtcNow.AddMonths(-i);
            var ms = new DateTime(md.Year, md.Month, 1);
            var me = ms.AddMonths(1);
            var fk = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= ms && h.HarvestDate < me).SumAsync(h => h.TotalWeightKg);
            var ol = await _db.PalmProcessings.Where(p => !p.IsDeleted && p.ProcessingDate >= ms && p.ProcessingDate < me).SumAsync(p => p.PalmOilLitres)
                + await _db.Productions.Where(p => p.Category == "Palm Oil" && new[] { "l", "litre", "litres", "liter", "liters" }.Contains(p.Unit.ToLower()) && p.Date >= ms && p.Date < me).SumAsync(p => p.Quantity);
            harvestTrend.Add(new HarvestTrendDto { Period = md.ToString("MMM yy"), FruitKg = fk, OilLitres = ol });
        }

        // Cattle
        var activeCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active);
        var male = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.Sex == CattleSex.Male);
        var female = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.Sex == CattleSex.Female);
        var youthCutoff = DateTime.UtcNow.AddMonths(-24);
        var young = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.DateOfBirth >= youthCutoff);
        var totalAcqCost = await _db.Cattle.Where(c => !c.IsDeleted).SumAsync(c => c.AcquisitionCost);
        var feedCost = await _db.CattleFeedings.SumAsync(f => f.Cost);
        var vetCost = await _db.CattleHealthRecords.Where(h => !h.IsDeleted).SumAsync(h => h.TreatmentCost);
        var avgWeight = activeCattle > 0 ? await _db.Cattle.Where(c => !c.IsDeleted && c.Status == CattleStatus.Active).AverageAsync(c => c.CurrentWeightKg ?? 0) : 0;
        var cattleProfit = cattleRev - (totalAcqCost + feedCost + vetCost);

        // Expense breakdown
        var breakdown = new List<ExpenseBreakdownDto>();
        if (totalExpenses > 0)
        {
            breakdown.Add(new ExpenseBreakdownDto { Division = "Palm Oil", Amount = palmExp, Percentage = Math.Round(palmExp / totalExpenses * 100, 1) });
            breakdown.Add(new ExpenseBreakdownDto { Division = "Cattle", Amount = cattleExp, Percentage = Math.Round(cattleExp / totalExpenses * 100, 1) });
            breakdown.Add(new ExpenseBreakdownDto { Division = "General", Amount = genExp, Percentage = Math.Round(genExp / totalExpenses * 100, 1) });
            breakdown.Add(new ExpenseBreakdownDto { Division = "Salaries", Amount = salaryExp, Percentage = Math.Round(salaryExp / totalExpenses * 100, 1) });
        }

        // Monthly trend
        var months = new List<MonthlyRevenueDto>();
        for (int i = 5; i >= 0; i--)
        {
            var md = DateTime.UtcNow.AddMonths(-i);
            var ms = new DateTime(md.Year, md.Month, 1);
            var me = ms.AddMonths(1);
            var r = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= ms && s.SaleDate < me).SumAsync(s => s.TotalPrice)
                  + await _db.CattleSales.Where(s => s.SaleDate >= ms && s.SaleDate < me).SumAsync(s => s.SalePrice);
            var e2 = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= ms && e.Date < me).SumAsync(e => e.Amount);
            months.Add(new MonthlyRevenueDto { Month = md.ToString("MMM yyyy"), Revenue = r, Expenses = e2, Profit = r - e2 });
        }

        return new CompanyAnalyticsDto
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            NetProfit = netProfit,
            ProfitMarginPercent = totalRevenue > 0 ? Math.Round(netProfit / totalRevenue * 100, 1) : 0,
            MonthlyTrend = months,
            ExpenseBreakdown = breakdown,
            PalmOil = new PalmOilAnalyticsDto { TotalFruitHarvestedKg = fruitKg, TotalOilProducedLitres = oilLitres, TotalOilSoldLitres = oilSold, CurrentStockLitres = oilStock, ProductionCost = palmProdCost + palmExp, Revenue = palmRev, Profit = palmRev - palmProdCost - palmExp, AverageYieldPercent = Math.Round(avgYield, 2), HarvestTrend = harvestTrend },
            Cattle = new CattleAnalyticsDto { TotalActiveCattle = activeCattle, MaleCattle = male, FemaleCattle = female, YoungCattle = young, AdultCattle = activeCattle - young, AcquisitionCostTotal = totalAcqCost, FeedingCostTotal = feedCost, VeterinaryCostTotal = vetCost, SalesRevenue = cattleRev, Profit = cattleProfit, AverageWeightKg = Math.Round(avgWeight, 1) }
        };
    }
}
