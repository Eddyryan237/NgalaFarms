namespace NgalaFarms.Application.DTOs;

public class FounderDashboardDto
{
    public FinancialKpiDto Financial { get; set; } = new();
    public PalmKpiDto PalmOil { get; set; } = new();
    public CattleKpiDto Cattle { get; set; } = new();
    public CompanyKpiDto Company { get; set; } = new();
}

public class FinancialKpiDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMarginPercent { get; set; }
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
}

public class MonthlyRevenueDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit { get; set; }
}

public class PalmKpiDto
{
    public decimal TotalFruitHarvestedKg { get; set; }
    public decimal TotalOilProducedLitres { get; set; }
    public decimal CurrentStockLitres { get; set; }
    public decimal AverageYieldPercent { get; set; }
    public decimal PalmRevenue { get; set; }
    public decimal PalmExpenses { get; set; }
}

public class CattleKpiDto
{
    public int TotalCattle { get; set; }
    public int MaleCattle { get; set; }
    public int FemaleCattle { get; set; }
    public int ActiveCattle { get; set; }
    public int HealthAlerts { get; set; }
    public int VaccinationsDue { get; set; }
    public decimal CattleRevenue { get; set; }
}

public class CompanyKpiDto
{
    public int TotalEmployees { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public int LowStockItems { get; set; }
    public int UnreadNotifications { get; set; }
}

public class ManagerDashboardDto
{
    public decimal TodaysPalmHarvestKg { get; set; }
    public decimal TodaysPalmOilProductionLitres { get; set; }
    public decimal CurrentPalmOilStockLitres { get; set; }
    public int TotalActiveCattle { get; set; }
    public int CattleHealthAlerts { get; set; }
    public decimal TodaysSalesRevenue { get; set; }
    public decimal TodaysExpenses { get; set; }
    public int ActiveEmployees { get; set; }
}
