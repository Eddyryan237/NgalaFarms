using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Domain.Enums;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.Infrastructure.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(NgalaFarmsDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        await context.Database.MigrateAsync();

        // Roles (idempotent and defensive)
        foreach (var role in new[] { "Founder", "Manager" })
        {
            var normalized = roleManager.NormalizeKey(role);
            var existsInStore = await roleManager.Roles.AnyAsync(r => r.NormalizedName == normalized);
            if (!existsInStore)
            {
                try
                {
                    var result = await roleManager.CreateAsync(new IdentityRole(role));
                    if (!result.Succeeded)
                    {
                        // ignore failures where role already exists in concurrent scenario
                    }
                }
                catch (DbUpdateException)
                {
                    // unique constraint race — ignore since role exists now
                }
                catch
                {
                    // swallow other create errors during seeding to avoid breaking tests
                }
            }
        }

        // Seed users: read from environment variables when available to avoid hard-coded secrets
        var defaultSeedPassword = Environment.GetEnvironmentVariable("DEFAULT_SEED_PASSWORD") ?? "ChangeMe#2026";
        var founderEmail = Environment.GetEnvironmentVariable("SEED_FOUNDER_EMAIL") ?? "founder@ngalafarms.com";
        var founderPassword = Environment.GetEnvironmentVariable("SEED_FOUNDER_PASSWORD") ?? "founderngala123";
        var founderFullName = Environment.GetEnvironmentVariable("SEED_FOUNDER_FULLNAME") ?? "Farm Founder";

        if (!await userManager.Users.AnyAsync(u => u.Email == founderEmail))
        {
            var founder = new ApplicationUser
            {
                UserName = founderEmail,
                Email = founderEmail,
                FullName = founderFullName,
                Role = "Founder",
                IsActive = true,
                EmailConfirmed = true
            };
            var res = await userManager.CreateAsync(founder, founderPassword);
            if (res.Succeeded)
            {
                var created = await userManager.FindByEmailAsync(founderEmail);
                if (created != null && !await userManager.IsInRoleAsync(created, "Founder"))
                    await userManager.AddToRoleAsync(created, "Founder");
            }
        }

        var managerEmail = Environment.GetEnvironmentVariable("SEED_MANAGER_EMAIL") ?? "manager@ngalafarms.com";
        var managerPassword = Environment.GetEnvironmentVariable("SEED_MANAGER_PASSWORD") ?? "nmanager123";
        var managerFullName = Environment.GetEnvironmentVariable("SEED_MANAGER_FULLNAME") ?? "Farm Manager";

        if (!await userManager.Users.AnyAsync(u => u.Email == managerEmail))
        {
            var manager = new ApplicationUser
            {
                UserName = managerEmail,
                Email = managerEmail,
                FullName = managerFullName,
                Role = "Manager",
                IsActive = true,
                EmailConfirmed = true
            };
            var res = await userManager.CreateAsync(manager, managerPassword);
            if (res.Succeeded)
            {
                var created = await userManager.FindByEmailAsync(managerEmail);
                if (created != null && !await userManager.IsInRoleAsync(created, "Manager"))
                    await userManager.AddToRoleAsync(created, "Manager");
            }
        }

        // Ensure basic customers exist (Sales depends on these)
        if (!await context.Customers.AnyAsync())
        {
            context.Customers.AddRange(
                    new Customer { CustomerId = "CUST-0001", Name = "Local Distributor", Email = "dist@ngalafarms.com", Phone = "+237111111111", Address = "Ngala Market" },
                    new Customer { CustomerId = "CUST-0002", Name = "Retailer Outlet", Email = "retail@ngalafarms.com", Phone = "+237222222222", Address = "Ngala Town" }
            );
            await context.SaveChangesAsync();
        }

        // Company Settings
        if (!await context.CompanySettings.AnyAsync())
        {
            context.CompanySettings.Add(new CompanySettings
            {
                CompanyName = "Ngala Farms",
                Currency = "XAF",
                Email = "info@ngalafarms.com",
                Phone = "+237 000 000 000",
                Address = "Ngala, Cameroon",
                Description = "Palm Oil & Cattle Production"
            });
            await context.SaveChangesAsync();
        }

        // Plantations
        if (!await context.Plantations.AnyAsync())
        {
            context.Plantations.AddRange(
                new Plantation { PlantationId = "PLT-0001", Name = "Main Plantation", Location = "Ngala Block A", TotalAreaHectares = 50, NumberOfTrees = 2500, PlantingDate = new DateTime(2010, 3, 1), PalmVariety = "Tenera", Status = PlantationStatus.Active },
                new Plantation { PlantationId = "PLT-0002", Name = "North Plantation", Location = "Ngala Block B", TotalAreaHectares = 30, NumberOfTrees = 1500, PlantingDate = new DateTime(2015, 6, 1), PalmVariety = "Dura", Status = PlantationStatus.Active }
            );
            await context.SaveChangesAsync();
        }

        // Palm Blocks
        if (!await context.PalmBlocks.AnyAsync())
        {
            var plt1 = await context.Plantations.FirstAsync(p => p.PlantationId == "PLT-0001");
            var plt2 = await context.Plantations.FirstAsync(p => p.PlantationId == "PLT-0002");
            context.PalmBlocks.AddRange(
                new PalmBlock { BlockId = "A1", Name = "Block A1", PlantationId = plt1.Id, AreaHectares = 12, NumberOfTrees = 600, PlantingDate = new DateTime(2010, 3, 1) },
                new PalmBlock { BlockId = "A2", Name = "Block A2", PlantationId = plt1.Id, AreaHectares = 13, NumberOfTrees = 650, PlantingDate = new DateTime(2010, 3, 1) },
                new PalmBlock { BlockId = "A3", Name = "Block A3", PlantationId = plt1.Id, AreaHectares = 12, NumberOfTrees = 600, PlantingDate = new DateTime(2010, 6, 1) },
                new PalmBlock { BlockId = "A4", Name = "Block A4", PlantationId = plt1.Id, AreaHectares = 13, NumberOfTrees = 650, PlantingDate = new DateTime(2010, 9, 1) },
                new PalmBlock { BlockId = "B1", Name = "Block B1", PlantationId = plt2.Id, AreaHectares = 15, NumberOfTrees = 750, PlantingDate = new DateTime(2015, 6, 1) },
                new PalmBlock { BlockId = "B2", Name = "Block B2", PlantationId = plt2.Id, AreaHectares = 15, NumberOfTrees = 750, PlantingDate = new DateTime(2015, 9, 1) }
            );
            await context.SaveChangesAsync();
        }

        // Cattle
        if (!await context.Cattle.AnyAsync())
        {
            context.Cattle.AddRange(
                new Cattle { CattleId = "COW-0001", TagNumber = "TAG-001", Name = "Boss", Sex = CattleSex.Male, Breed = "Fulani", DateOfBirth = new DateTime(2020, 1, 15), AcquisitionDate = new DateTime(2020, 3, 1), AcquisitionCost = 350000, CurrentWeightKg = 520, Location = "Pen A" },
                new Cattle { CattleId = "COW-0002", TagNumber = "TAG-002", Name = "Bella", Sex = CattleSex.Female, Breed = "Fulani", DateOfBirth = new DateTime(2020, 4, 20), AcquisitionDate = new DateTime(2020, 6, 1), AcquisitionCost = 280000, CurrentWeightKg = 380, Location = "Pen A" },
                new Cattle { CattleId = "COW-0003", TagNumber = "TAG-003", Sex = CattleSex.Female, Breed = "Zebu", DateOfBirth = new DateTime(2021, 2, 10), AcquisitionDate = new DateTime(2021, 4, 1), AcquisitionCost = 265000, CurrentWeightKg = 340, Location = "Pen B" },
                new Cattle { CattleId = "COW-0004", TagNumber = "TAG-004", Sex = CattleSex.Male, Breed = "Zebu", DateOfBirth = new DateTime(2022, 5, 5), AcquisitionDate = new DateTime(2022, 7, 1), AcquisitionCost = 210000, CurrentWeightKg = 290, Location = "Pen B" },
                new Cattle { CattleId = "COW-0005", TagNumber = "TAG-005", Name = "King", Sex = CattleSex.Male, Breed = "Fulani", DateOfBirth = new DateTime(2019, 8, 20), AcquisitionDate = new DateTime(2019, 10, 1), AcquisitionCost = 400000, CurrentWeightKg = 580, Location = "Pen A" },
                new Cattle { CattleId = "COW-0006", TagNumber = "TAG-006", Sex = CattleSex.Female, Breed = "Fulani", DateOfBirth = new DateTime(2021, 11, 3), AcquisitionDate = new DateTime(2022, 1, 1), AcquisitionCost = 270000, CurrentWeightKg = 350, Location = "Pen C" },
                new Cattle { CattleId = "COW-0007", TagNumber = "TAG-007", Sex = CattleSex.Female, Breed = "Ndama", DateOfBirth = new DateTime(2023, 3, 15), AcquisitionDate = new DateTime(2023, 5, 1), AcquisitionCost = 180000, CurrentWeightKg = 210, Location = "Pen C" },
                new Cattle { CattleId = "COW-0008", TagNumber = "TAG-008", Sex = CattleSex.Male, Breed = "Ndama", DateOfBirth = new DateTime(2023, 7, 10), AcquisitionDate = new DateTime(2023, 9, 1), AcquisitionCost = 195000, CurrentWeightKg = 230, Location = "Pen B" }
            );
            await context.SaveChangesAsync();
        }

        // Inventories
        if (!await context.Inventories.AnyAsync())
        {
            context.Inventories.AddRange(
                new Inventory { ProductName = "Palm Fruit", Unit = "KG", CurrentQuantity = 3200, MinimumQuantity = 500, StorageLocation = "Processing Yard" },
                new Inventory { ProductName = "Palm Oil", Unit = "Litres", CurrentQuantity = 850, MinimumQuantity = 100, StorageLocation = "Storage Tank A" }
            );
            await context.SaveChangesAsync();
        }

        // Palm Harvests (recent)
        if (!await context.PalmHarvests.AnyAsync())
        {
            var block1 = await context.PalmBlocks.FirstAsync(b => b.BlockId == "A1");
            var plt1 = await context.Plantations.FirstAsync(p => p.PlantationId == "PLT-0001");
            context.PalmHarvests.AddRange(
                new PalmHarvest { HarvestId = "HAR-0001", PlantationId = plt1.Id, PalmBlockId = block1.Id, HarvestDate = new DateTime(2026, 7, 5), NumberOfBunches = 420, TotalWeightKg = 2650, HarvestTeam = "Team Alpha", LaborCost = 45000, IsProcessed = true },
                new PalmHarvest { HarvestId = "HAR-0002", PlantationId = plt1.Id, HarvestDate = new DateTime(2026, 7, 19), NumberOfBunches = 450, TotalWeightKg = 2850, HarvestTeam = "Team Alpha", LaborCost = 48000, IsProcessed = true },
                new PalmHarvest { HarvestId = "HAR-0003", PlantationId = plt1.Id, PalmBlockId = block1.Id, HarvestDate = new DateTime(2026, 8, 2), NumberOfBunches = 380, TotalWeightKg = 2400, HarvestTeam = "Team Beta", LaborCost = 42000, IsProcessed = false }
            );
            await context.SaveChangesAsync();
        }

        // Palm Processing
        if (!await context.PalmProcessings.AnyAsync())
        {
            context.PalmProcessings.AddRange(
                new PalmProcessing { ProcessingId = "PROC-0001", ProcessingDate = new DateTime(2026, 7, 8), RawFruitKg = 2650, PalmOilLitres = 610, ProcessingCost = 35000, LaborCost = 30000, FuelCost = 15000, WasteKg = 450, YieldPercentage = 23.02m },
                new PalmProcessing { ProcessingId = "PROC-0002", ProcessingDate = new DateTime(2026, 7, 22), RawFruitKg = 2850, PalmOilLitres = 655, ProcessingCost = 37000, LaborCost = 32000, FuelCost = 16000, WasteKg = 490, YieldPercentage = 22.98m }
            );
            await context.SaveChangesAsync();
        }

        // Sales
        if (!await context.Sales.AnyAsync())
        {
            var cust1 = await context.Customers.FirstOrDefaultAsync(c => c.CustomerId == "CUST-0001");
            var cust2 = await context.Customers.FirstOrDefaultAsync(c => c.CustomerId == "CUST-0002");
            context.Sales.AddRange(
                new Sale { InvoiceId = "INV-0001", CustomerId = cust1 != null ? cust1.Id : null, CustomerName = cust1 != null ? cust1.Name : "Local Distributor", Product = "Palm Oil", QuantityLitres = 200, UnitPrice = 1800, TotalPrice = 360000, PaymentMethod = PaymentMethod.BankTransfer, PaymentStatus = PaymentStatus.Paid, SaleDate = new DateTime(2026, 7, 15) },
                new Sale { InvoiceId = "INV-0002", CustomerId = cust2 != null ? cust2.Id : null, CustomerName = cust2 != null ? cust2.Name : "Retailer Outlet", Product = "Palm Oil", QuantityLitres = 150, UnitPrice = 1850, TotalPrice = 277500, PaymentMethod = PaymentMethod.Cash, PaymentStatus = PaymentStatus.Paid, SaleDate = new DateTime(2026, 7, 28) },
                new Sale { InvoiceId = "INV-0003", CustomerName = "Direct Customer", Product = "Palm Oil", QuantityLitres = 80, UnitPrice = 1900, TotalPrice = 152000, PaymentMethod = PaymentMethod.MobileMoney, PaymentStatus = PaymentStatus.Paid, SaleDate = new DateTime(2026, 8, 5) }
            );
            await context.SaveChangesAsync();
        }

        // Expenses
        if (!await context.Expenses.AnyAsync())
        {
            context.Expenses.AddRange(
                new Expense { ExpenseId = "EXP-0001", Category = "Harvest Labor", Division = ExpenseDivision.PalmOil, Description = "Palm harvest team wages - July week 1", Amount = 45000, Date = new DateTime(2026, 7, 5), PaymentMethod = PaymentMethod.Cash },
                new Expense { ExpenseId = "EXP-0002", Category = "Processing", Division = ExpenseDivision.PalmOil, Description = "Palm processing fuel and materials", Amount = 51000, Date = new DateTime(2026, 7, 8), PaymentMethod = PaymentMethod.Cash },
                new Expense { ExpenseId = "EXP-0003", Category = "Cattle Feed", Division = ExpenseDivision.Cattle, Description = "Monthly feed purchase - hay and supplements", Amount = 85000, Date = new DateTime(2026, 7, 1), PaymentMethod = PaymentMethod.BankTransfer },
                new Expense { ExpenseId = "EXP-0004", Category = "Veterinary Care", Division = ExpenseDivision.Cattle, Description = "Quarterly vet visit and medication", Amount = 45000, Date = new DateTime(2026, 7, 10), PaymentMethod = PaymentMethod.Cash },
                new Expense { ExpenseId = "EXP-0005", Category = "Electricity", Division = ExpenseDivision.General, Description = "Monthly electricity bill", Amount = 28000, Date = new DateTime(2026, 7, 31), PaymentMethod = PaymentMethod.BankTransfer },
                new Expense { ExpenseId = "EXP-0006", Category = "Harvest Labor", Division = ExpenseDivision.PalmOil, Description = "Palm harvest team wages - July week 3", Amount = 48000, Date = new DateTime(2026, 7, 19), PaymentMethod = PaymentMethod.Cash },
                new Expense { ExpenseId = "EXP-0007", Category = "Cattle Feed", Division = ExpenseDivision.Cattle, Description = "Feed purchase - August", Amount = 88000, Date = new DateTime(2026, 8, 1), PaymentMethod = PaymentMethod.BankTransfer },
                new Expense { ExpenseId = "EXP-0008", Category = "Farm Equipment", Division = ExpenseDivision.General, Description = "Harvesting tools maintenance", Amount = 32000, Date = new DateTime(2026, 8, 3), PaymentMethod = PaymentMethod.Cash }
            );
            await context.SaveChangesAsync();
        }

        // Cattle weight records
        if (!await context.CattleWeightRecords.AnyAsync())
        {
            var cow1 = await context.Cattle.FirstAsync(c => c.CattleId == "COW-0001");
            var cow2 = await context.Cattle.FirstAsync(c => c.CattleId == "COW-0002");
            context.CattleWeightRecords.AddRange(
                new CattleWeightRecord { CattleId = cow1.Id, RecordDate = new DateTime(2026, 2, 1), WeightKg = 480 },
                new CattleWeightRecord { CattleId = cow1.Id, RecordDate = new DateTime(2026, 4, 1), WeightKg = 498 },
                new CattleWeightRecord { CattleId = cow1.Id, RecordDate = new DateTime(2026, 6, 1), WeightKg = 510 },
                new CattleWeightRecord { CattleId = cow1.Id, RecordDate = new DateTime(2026, 8, 1), WeightKg = 520 },
                new CattleWeightRecord { CattleId = cow2.Id, RecordDate = new DateTime(2026, 2, 1), WeightKg = 350 },
                new CattleWeightRecord { CattleId = cow2.Id, RecordDate = new DateTime(2026, 4, 1), WeightKg = 360 },
                new CattleWeightRecord { CattleId = cow2.Id, RecordDate = new DateTime(2026, 6, 1), WeightKg = 370 },
                new CattleWeightRecord { CattleId = cow2.Id, RecordDate = new DateTime(2026, 8, 1), WeightKg = 380 }
            );
            await context.SaveChangesAsync();
        }

        // Cattle health records
        if (!await context.CattleHealthRecords.AnyAsync())
        {
            var cow3 = await context.Cattle.FirstAsync(c => c.CattleId == "COW-0003");
            var cow6 = await context.Cattle.FirstAsync(c => c.CattleId == "COW-0006");
            context.CattleHealthRecords.AddRange(
                new CattleHealthRecord { CattleId = cow3.Id, RecordDate = new DateTime(2026, 7, 20), Condition = "Mild respiratory infection", Treatment = "Antibiotics", Medication = "Oxytetracycline", TreatmentCost = 12000, VeterinaryName = "Dr. Manga", FollowUpDate = new DateTime(2026, 8, 5) },
                new CattleHealthRecord { CattleId = cow6.Id, RecordDate = new DateTime(2026, 8, 1), Condition = "Hoof crack", Treatment = "Hoof trimming and treatment", TreatmentCost = 8000, VeterinaryName = "Dr. Manga", FollowUpDate = new DateTime(2026, 8, 15) }
            );
            await context.SaveChangesAsync();
        }

        // Cattle vaccinations
        if (!await context.CattleVaccinations.AnyAsync())
        {
            var cattle = await context.Cattle.Take(5).ToListAsync();
            foreach (var c in cattle)
            {
                context.CattleVaccinations.Add(new CattleVaccination
                {
                    CattleId = c.Id,
                    VaccineName = "FMD (Foot and Mouth Disease)",
                    VaccinationDate = new DateTime(2026, 5, 1),
                    NextDueDate = new DateTime(2026, 11, 1),
                    AdministeredBy = "Dr. Manga",
                    Cost = 5000
                });
            }
            await context.SaveChangesAsync();
        }

        // Notifications
        if (!await context.Notifications.AnyAsync())
        {
            context.Notifications.AddRange(
                new Notification { Title = "Low Palm Oil Stock", Message = "Palm oil inventory is approaching minimum threshold. Current stock: 850 litres.", Category = NotificationCategory.LowStock, Priority = NotificationPriority.Medium },
                new Notification { Title = "Cattle Health Alert", Message = "COW-0003 requires follow-up treatment by August 5, 2026.", Category = NotificationCategory.CattleHealth, Priority = NotificationPriority.High },
                new Notification { Title = "Vaccination Due", Message = "5 cattle are due for FMD vaccination in November 2026.", Category = NotificationCategory.Vaccination, Priority = NotificationPriority.Medium },
                new Notification { Title = "Weekly Report Available", Message = "Weekly business analytics report for the week of August 4-10, 2026 is ready.", Category = NotificationCategory.WeeklyReport, Priority = NotificationPriority.Low }
            );
            await context.SaveChangesAsync();
        }

        // Daily operations sample
        if (!await context.DailyOperations.AnyAsync())
        {
            context.DailyOperations.AddRange(
                new DailyOperation { Date = DateTime.UtcNow.AddDays(-2), OperationType = "Clearing", Description = "Cleared block A1", PerformedBy = "manager@ngalafarms.com", PlantationId = "PLT-0001", PalmBlockId = "A1" },
                new DailyOperation { Date = DateTime.UtcNow.AddDays(-1), OperationType = "Pegging", Description = "Pegged new row in B1", PerformedBy = "manager@ngalafarms.com", PlantationId = "PLT-0002", PalmBlockId = "B1" }
            );
            await context.SaveChangesAsync();
        }

        // Daily operations seed (example)
        if (!await context.DailyOperations.AnyAsync())
        {
            context.DailyOperations.AddRange(
                new DailyOperation { Date = DateTime.UtcNow.AddDays(-2), OperationType = "Clearing", Description = "Cleared section A1", PerformedBy = "manager@ngalafarms.com", PlantationId = "PLT-0001", PalmBlockId = "A1" },
                new DailyOperation { Date = DateTime.UtcNow.AddDays(-1), OperationType = "Pegging", Description = "Pegged new seedlings in B1", PerformedBy = "manager@ngalafarms.com", PlantationId = "PLT-0002", PalmBlockId = "B1" }
            );
            await context.SaveChangesAsync();
        }

        // Salaries (seed July 2026)
        if (!await context.Salaries.AnyAsync())
        {
            var employees = await context.Employees.ToListAsync();
            foreach (var emp in employees)
            {
                context.Salaries.Add(new Salary
                {
                    EmployeeId = emp.Id,
                    Amount = emp.MonthlySalary,
                    Period = "July 2026",
                    PeriodStart = new DateTime(2026, 7, 1),
                    PeriodEnd = new DateTime(2026, 7, 31),
                    PaymentDate = new DateTime(2026, 8, 1),
                    Status = SalaryStatus.Paid,
                    PaymentMethod = PaymentMethod.BankTransfer
                });
            }
            await context.SaveChangesAsync();
        }
    }
}
