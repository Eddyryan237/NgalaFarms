using NgalaFarms.Domain.Enums;

namespace NgalaFarms.Application.DTOs;

public class CattleDto
{
    public int Id { get; set; }
    public string CattleId { get; set; } = string.Empty;
    public string? TagNumber { get; set; }
    public string? Name { get; set; }
    public CattleSex Sex { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public CattleStatus Status { get; set; }
    public decimal? CurrentWeightKg { get; set; }
    public string? ParentInfo { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string? Remarks { get; set; }
    public int AgeMonths { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCattleRequest
{
    public string? TagNumber { get; set; }
    public string? Name { get; set; }
    public CattleSex Sex { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime AcquisitionDate { get; set; }
    public decimal AcquisitionCost { get; set; }
    public decimal? CurrentWeightKg { get; set; }
    public string? ParentInfo { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string? Remarks { get; set; }
}

public class CattleHealthRecordDto
{
    public int Id { get; set; }
    public int CattleId { get; set; }
    public string CattleTag { get; set; } = string.Empty;
    public DateTime RecordDate { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string? Treatment { get; set; }
    public string? Medication { get; set; }
    public decimal TreatmentCost { get; set; }
    public string? VeterinaryName { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCattleHealthRecordRequest
{
    public int CattleId { get; set; }
    public DateTime RecordDate { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string? Treatment { get; set; }
    public string? Medication { get; set; }
    public decimal TreatmentCost { get; set; }
    public string? VeterinaryName { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? Notes { get; set; }
}

public class CattleVaccinationDto
{
    public int Id { get; set; }
    public int CattleId { get; set; }
    public string CattleTag { get; set; } = string.Empty;
    public string VaccineName { get; set; } = string.Empty;
    public DateTime VaccinationDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public string? AdministeredBy { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}

public class CreateCattleVaccinationRequest
{
    public int CattleId { get; set; }
    public string VaccineName { get; set; } = string.Empty;
    public DateTime VaccinationDate { get; set; }
    public DateTime? NextDueDate { get; set; }
    public string? AdministeredBy { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}

public class CattleFeedingDto
{
    public int Id { get; set; }
    public int? CattleId { get; set; }
    public string? CattleTag { get; set; }
    public string? GroupName { get; set; }
    public DateTime FeedingDate { get; set; }
    public string FeedType { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}

public class CreateCattleFeedingRequest
{
    public int? CattleId { get; set; }
    public string? GroupName { get; set; }
    public DateTime FeedingDate { get; set; }
    public string FeedType { get; set; } = string.Empty;
    public decimal QuantityKg { get; set; }
    public decimal Cost { get; set; }
    public string? Notes { get; set; }
}

public class CattleWeightRecordDto
{
    public int Id { get; set; }
    public int CattleId { get; set; }
    public string CattleTag { get; set; } = string.Empty;
    public DateTime RecordDate { get; set; }
    public decimal WeightKg { get; set; }
    public string? Notes { get; set; }
}

public class CreateCattleWeightRecordRequest
{
    public int CattleId { get; set; }
    public DateTime RecordDate { get; set; }
    public decimal WeightKg { get; set; }
    public string? Notes { get; set; }
}

public class CattlePurchaseDto
{
    public int Id { get; set; }
    public string PurchaseId { get; set; } = string.Empty;
    public int CattleId { get; set; }
    public string CattleTag { get; set; } = string.Empty;
    public int? SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal WeightAtPurchaseKg { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CattleSaleDto
{
    public int Id { get; set; }
    public string SaleId { get; set; } = string.Empty;
    public int CattleId { get; set; }
    public string CattleTag { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal SalePrice { get; set; }
    public decimal WeightAtSaleKg { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateCattleSaleRequest
{
    public int CattleId { get; set; }
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal SalePrice { get; set; }
    public decimal WeightAtSaleKg { get; set; }
    public NgalaFarms.Domain.Enums.PaymentStatus PaymentStatus { get; set; }
    public string? Notes { get; set; }
}
