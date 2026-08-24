using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Enums;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Services;

public interface IDashboardService
{
    Task<FounderDashboardDto> GetFounderDashboardAsync();
    Task<ManagerDashboardDto> GetManagerDashboardAsync();
}

public class DashboardService : IDashboardService
{
    private readonly NgalaFarmsDbContext _db;
    public DashboardService(NgalaFarmsDbContext db) => _db = db;

    public async Task<FounderDashboardDto> GetFounderDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var yearStart = new DateTime(now.Year, 1, 1);

        var totalRevenue = await _db.Sales.Where(s => !s.IsDeleted).SumAsync(s => s.TotalPrice)
                         + await _db.CattleSales.SumAsync(s => s.SalePrice);
        var totalExpenses = await _db.Expenses.Where(e => !e.IsDeleted).SumAsync(e => e.Amount)
                 + await _db.Salaries.Where(s => s.Status == SalaryStatus.Paid && !_db.Expenses.Any(e => e.SalaryId == s.Id && !e.IsDeleted)).SumAsync(s => s.Amount);
        var netProfit = totalRevenue - totalExpenses;

        // Monthly trend – last 6 months
        var months = new List<MonthlyRevenueDto>();
        for (int i = 5; i >= 0; i--)
        {
            var monthDate = now.AddMonths(-i);
            var mStart = new DateTime(monthDate.Year, monthDate.Month, 1);
            var mEnd = mStart.AddMonths(1);
            var rev = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= mStart && s.SaleDate < mEnd).SumAsync(s => s.TotalPrice)
                    + await _db.CattleSales.Where(s => s.SaleDate >= mStart && s.SaleDate < mEnd).SumAsync(s => s.SalePrice);
            var exp = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= mStart && e.Date < mEnd).SumAsync(e => e.Amount)
                + await _db.Salaries.Where(s => s.PeriodStart >= mStart && s.PeriodStart < mEnd && s.Status == SalaryStatus.Paid && !_db.Expenses.Any(e => e.SalaryId == s.Id && !e.IsDeleted)).SumAsync(s => s.Amount);
            months.Add(new MonthlyRevenueDto { Month = monthDate.ToString("MMM yyyy"), Revenue = rev, Expenses = exp, Profit = rev - exp });
        }

        var palmOilProduced = await _db.PalmProcessings.Where(p => !p.IsDeleted).SumAsync(p => p.PalmOilLitres);
        var palmOilSold = await _db.Sales.Where(s => !s.IsDeleted && s.Product.ToLower().Contains("palm")).SumAsync(s => s.QuantityLitres);
        var palmStock = Math.Max(0, palmOilProduced - palmOilSold);
        var palmRevenue = await _db.Sales.Where(s => !s.IsDeleted).SumAsync(s => s.TotalPrice);
        var palmExpenses = await _db.Expenses.Where(e => !e.IsDeleted && e.Division == ExpenseDivision.PalmOil).SumAsync(e => e.Amount);
        var palmFruitKg = await _db.PalmHarvests.Where(h => !h.IsDeleted).SumAsync(h => h.TotalWeightKg);
        var palmOilLitres = palmOilProduced;
        var avgYield = palmFruitKg > 0 ? (palmOilLitres / palmFruitKg) * 100 : 0;

        var activeCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active);
        var maleCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.Sex == CattleSex.Male);
        var femaleCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.Sex == CattleSex.Female);
        var healthAlerts = await _db.CattleHealthRecords.CountAsync(h => !h.IsDeleted && h.FollowUpDate >= now);
        var vacsDue = await _db.CattleVaccinations.CountAsync(v => !v.IsDeleted && v.NextDueDate <= now.AddDays(30));
        var cattleRevenue = await _db.CattleSales.SumAsync(s => s.SalePrice);

        var youthCutoff = now.AddMonths(-24);
        var youngCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active && c.DateOfBirth >= youthCutoff);

        var sheep = await _db.Sheep.Where(s => !s.IsDeleted).ToListAsync();
        var employees = await _db.Employees.CountAsync(e => !e.IsDeleted && e.Status == EmployeeStatus.Active);
        var customers = await _db.Customers.CountAsync(c => !c.IsDeleted);
        var suppliers = await _db.Suppliers.CountAsync(s => !s.IsDeleted);
        var lowStock = await _db.Inventories.CountAsync(i => !i.IsDeleted && i.CurrentQuantity <= i.MinimumQuantity);
        var unread = await _db.Notifications.CountAsync(n => !n.IsDeleted && !n.IsRead);

        return new FounderDashboardDto
        {
            Financial = new FinancialKpiDto { TotalRevenue = totalRevenue, TotalExpenses = totalExpenses, NetProfit = netProfit, ProfitMarginPercent = totalRevenue > 0 ? Math.Round(netProfit / totalRevenue * 100, 1) : 0, MonthlyRevenue = months },
            PalmOil = new PalmKpiDto { TotalFruitHarvestedKg = palmFruitKg, TotalOilProducedLitres = palmOilLitres, CurrentStockLitres = palmStock, AverageYieldPercent = Math.Round(avgYield, 2), PalmRevenue = palmRevenue, PalmExpenses = palmExpenses },
            Cattle = new CattleKpiDto { TotalCattle = activeCattle + maleCattle - maleCattle + activeCattle - activeCattle + activeCattle, MaleCattle = maleCattle, FemaleCattle = femaleCattle, ActiveCattle = activeCattle, HealthAlerts = healthAlerts, VaccinationsDue = vacsDue, CattleRevenue = cattleRevenue },
            Sheep = new SheepKpiDto { TotalSheep = sheep.Count, MaleSheep = sheep.Count(s => s.Sex == "Male"), FemaleSheep = sheep.Count(s => s.Sex == "Female"), TotalWeightKg = sheep.Sum(s => s.CurrentWeightKg ?? 0) },
            Company = new CompanyKpiDto { TotalEmployees = employees, TotalCustomers = customers, TotalSuppliers = suppliers, LowStockItems = lowStock, UnreadNotifications = unread }
        };
    }

    public async Task<ManagerDashboardDto> GetManagerDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var now = DateTime.UtcNow;

        var todayHarvest = await _db.PalmHarvests.Where(h => !h.IsDeleted && h.HarvestDate >= today && h.HarvestDate < tomorrow).SumAsync(h => h.TotalWeightKg);
        var todayProduction = await _db.PalmProcessings.Where(p => p.ProcessingDate >= today && p.ProcessingDate < tomorrow).SumAsync(p => p.PalmOilLitres);
        var palmOilProduced = await _db.PalmProcessings.Where(p => !p.IsDeleted).SumAsync(p => p.PalmOilLitres);
        var palmOilSold = await _db.Sales.Where(s => !s.IsDeleted && s.Product.ToLower().Contains("palm")).SumAsync(s => s.QuantityLitres);
        var palmStock = Math.Max(0, palmOilProduced - palmOilSold);
        var activeCattle = await _db.Cattle.CountAsync(c => !c.IsDeleted && c.Status == CattleStatus.Active);
        var healthAlerts = await _db.CattleHealthRecords.CountAsync(h => !h.IsDeleted && h.FollowUpDate >= now);
        var todaySales = await _db.Sales.Where(s => !s.IsDeleted && s.SaleDate >= today && s.SaleDate < tomorrow).SumAsync(s => s.TotalPrice);
        var totalProductionQuantity = await _db.PalmProcessings.Where(p => !p.IsDeleted).SumAsync(p => p.PalmOilLitres);
        var todayExpenses = await _db.Expenses.Where(e => !e.IsDeleted && e.Date >= today && e.Date < tomorrow).SumAsync(e => e.Amount);
        var activeEmp = await _db.Employees.CountAsync(e => !e.IsDeleted && e.Status == EmployeeStatus.Active);
        var sheep = await _db.Sheep.Where(s => !s.IsDeleted).ToListAsync();

        return new ManagerDashboardDto
        {
            TodaysPalmHarvestKg = todayHarvest,
            TodaysPalmOilProductionLitres = todayProduction,
            CurrentPalmOilStockLitres = palmStock,
            TotalActiveCattle = activeCattle,
            CattleHealthAlerts = healthAlerts,
            TodaysSalesRevenue = todaySales,
            TotalProductionQuantity = totalProductionQuantity,
            TodaysExpenses = todayExpenses,
            ActiveEmployees = activeEmp
            ,Sheep = new SheepKpiDto { TotalSheep = sheep.Count, MaleSheep = sheep.Count(s => s.Sex == "Male"), FemaleSheep = sheep.Count(s => s.Sex == "Female"), TotalWeightKg = sheep.Sum(s => s.CurrentWeightKg ?? 0) }
        };
    }
}
