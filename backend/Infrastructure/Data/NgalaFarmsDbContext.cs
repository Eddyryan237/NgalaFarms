using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Domain.Entities;

namespace NgalaFarms.Infrastructure.Data;

public class NgalaFarmsDbContext : IdentityDbContext<ApplicationUser>
{
    public NgalaFarmsDbContext(DbContextOptions<NgalaFarmsDbContext> options) : base(options) { }

    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Plantation> Plantations => Set<Plantation>();
    public DbSet<PalmBlock> PalmBlocks => Set<PalmBlock>();
    public DbSet<PalmHarvest> PalmHarvests => Set<PalmHarvest>();
    public DbSet<PalmProcessing> PalmProcessings => Set<PalmProcessing>();
    public DbSet<PalmOilBatch> PalmOilBatches => Set<PalmOilBatch>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Production> Productions => Set<Production>();
    public DbSet<Cattle> Cattle => Set<Cattle>();
    public DbSet<Sheep> Sheep => Set<Sheep>();
    public DbSet<CattleHealthRecord> CattleHealthRecords => Set<CattleHealthRecord>();
    public DbSet<CattleVaccination> CattleVaccinations => Set<CattleVaccination>();
    public DbSet<CattleFeeding> CattleFeedings => Set<CattleFeeding>();
    public DbSet<CattleWeightRecord> CattleWeightRecords => Set<CattleWeightRecord>();
    public DbSet<CattlePurchase> CattlePurchases => Set<CattlePurchase>();
    public DbSet<CattleSale> CattleSales => Set<CattleSale>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DailyOperation> DailyOperations => Set<DailyOperation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(NgalaFarmsDbContext).Assembly);

        // Soft delete global filter for BaseEntity types
        builder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Supplier>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Plantation>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PalmBlock>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PalmHarvest>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PalmProcessing>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PalmOilBatch>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Inventory>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Sale>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Expense>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Cattle>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Sheep>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<DailyOperation>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Interfaces.IBaseEntity &&
                        (e.State == EntityState.Added || e.State == EntityState.Modified));
        foreach (var entry in entries)
        {
            var entity = (Domain.Interfaces.IBaseEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Added)
                entity.CreatedAt = DateTime.UtcNow;
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
