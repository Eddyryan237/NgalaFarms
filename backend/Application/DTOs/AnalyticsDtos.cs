namespace NgalaFarms.Application.DTOs;

public class CompanyAnalyticsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMarginPercent { get; set; }
    public PalmOilAnalyticsDto PalmOil { get; set; } = new();
    public CattleAnalyticsDto Cattle { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyTrend { get; set; } = new();
    public List<ExpenseBreakdownDto> ExpenseBreakdown { get; set; } = new();
}

public class PalmOilAnalyticsDto
{
    public decimal TotalFruitHarvestedKg { get; set; }
    public decimal TotalOilProducedLitres { get; set; }
    public decimal TotalOilSoldLitres { get; set; }
    public decimal CurrentStockLitres { get; set; }
    public decimal ProductionCost { get; set; }
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
    public decimal AverageYieldPercent { get; set; }
    public List<HarvestTrendDto> HarvestTrend { get; set; } = new();
}

public class CattleAnalyticsDto
{
    public int TotalActiveCattle { get; set; }
    public int MaleCattle { get; set; }
    public int FemaleCattle { get; set; }
    public int YoungCattle { get; set; }
    public int AdultCattle { get; set; }
    public decimal AcquisitionCostTotal { get; set; }
    public decimal FeedingCostTotal { get; set; }
    public decimal VeterinaryCostTotal { get; set; }
    public decimal SalesRevenue { get; set; }
    public decimal Profit { get; set; }
    public decimal AverageWeightKg { get; set; }
}

public class HarvestTrendDto
{
    public string Period { get; set; } = string.Empty;
    public decimal FruitKg { get; set; }
    public decimal OilLitres { get; set; }
}

public class ExpenseBreakdownDto
{
    public string Division { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}
