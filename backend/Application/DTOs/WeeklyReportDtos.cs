namespace NgalaFarms.Application.DTOs;

public class WeeklyReportDto
{
    public int Id { get; set; }
    public string ReportId { get; set; } = string.Empty;
    public DateTime WeekStart { get; set; }
    public DateTime WeekEnd { get; set; }
    public string WeekLabel { get; set; } = string.Empty;
    public decimal PalmFruitHarvestedKg { get; set; }
    public decimal PalmOilProducedLitres { get; set; }
    public decimal PalmOilSoldLitres { get; set; }
    public decimal PalmOilRemainingLitres { get; set; }
    public decimal PalmProductionCost { get; set; }
    public decimal PalmSalesRevenue { get; set; }
    public decimal PalmYieldPercentage { get; set; }
    public int TotalCattle { get; set; }
    public int NewCattle { get; set; }
    public int CattleSold { get; set; }
    public decimal FeedingExpenses { get; set; }
    public decimal VeterinaryExpenses { get; set; }
    public decimal AverageWeightKg { get; set; }
    public int HealthAlerts { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal SalaryExpenses { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMarginPercent { get; set; }
    public DateTime GeneratedAt { get; set; }
}
