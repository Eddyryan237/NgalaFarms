CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetRoles" (
        "Id" TEXT NOT NULL,
        "Name" TEXT,
        "NormalizedName" TEXT,
        "ConcurrencyStamp" TEXT,
        CONSTRAINT "PK_AspNetRoles" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetUsers" (
        "Id" TEXT NOT NULL,
        "FullName" TEXT NOT NULL,
        "Role" TEXT NOT NULL,
        "IsActive" INTEGER NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "RefreshToken" TEXT,
        "RefreshTokenExpiry" TEXT,
        "UserName" TEXT,
        "NormalizedUserName" TEXT,
        "Email" TEXT,
        "NormalizedEmail" TEXT,
        "EmailConfirmed" INTEGER NOT NULL,
        "PasswordHash" TEXT,
        "SecurityStamp" TEXT,
        "ConcurrencyStamp" TEXT,
        "PhoneNumber" TEXT,
        "PhoneNumberConfirmed" INTEGER NOT NULL,
        "TwoFactorEnabled" INTEGER NOT NULL,
        "LockoutEnd" TEXT,
        "LockoutEnabled" INTEGER NOT NULL,
        "AccessFailedCount" INTEGER NOT NULL,
        CONSTRAINT "PK_AspNetUsers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AuditLogs" (
        "Id" INTEGER NOT NULL,
        "UserId" TEXT NOT NULL,
        "UserName" TEXT NOT NULL,
        "Action" TEXT NOT NULL,
        "EntityType" TEXT NOT NULL,
        "EntityId" TEXT,
        "PreviousValues" TEXT,
        "NewValues" TEXT,
        "IpAddress" TEXT,
        "Timestamp" TEXT NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Cattle" (
        "Id" INTEGER NOT NULL,
        "CattleId" TEXT NOT NULL,
        "TagNumber" TEXT,
        "Name" TEXT,
        "Sex" INTEGER NOT NULL,
        "Category" TEXT NOT NULL,
        "DateOfBirth" TEXT NOT NULL,
        "AcquisitionDate" TEXT NOT NULL,
        "AcquisitionCost" TEXT NOT NULL,
        "Status" INTEGER NOT NULL,
        "CurrentWeightKg" TEXT NOT NULL,
        "ParentInfo" TEXT,
        "Location" TEXT,
        "Notes" TEXT,
        "Remarks" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Cattle" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CompanySettings" (
        "Id" INTEGER NOT NULL,
        "CompanyName" TEXT NOT NULL,
        "LogoPath" TEXT,
        "LogoUrl" 
        "Phone" TEXT,
        "Email" TEXT,
        "Address" TEXT,
        "Description" TEXT,
        "Currency" TEXT NOT NULL,
        "Website" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CompanySettings" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Customers" (
        "Id" INTEGER NOT NULL,
        "CustomerId" TEXT NOT NULL,
        "Name" TEXT NOT NULL,
        "Phone" TEXT,
        "Email" TEXT,
        "Address" TEXT,
        "CustomerType" TEXT,
        "OutstandingBalance" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Customers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Employees" (
        "Id" INTEGER NOT NULL,
        "EmployeeId" TEXT NOT NULL,
        "FullName" TEXT NOT NULL,
        "Phone" TEXT,
        "Email" TEXT,
        "Address" TEXT,
        "Position" TEXT NOT NULL,
        "Department" TEXT NOT NULL,
        "MonthlySalary" TEXT NOT NULL,
        "EmploymentDate" TEXT NOT NULL,
        "Status" INTEGER NOT NULL,
        "EmergencyContact" TEXT,
        "EmergencyPhone" TEXT,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Employees" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Inventories" (
        "Id" INTEGER NOT NULL,
        "ProductName" TEXT NOT NULL,
        "Unit" TEXT NOT NULL,
        "CurrentQuantity" TEXT NOT NULL,
        "MinimumQuantity" TEXT NOT NULL,
        "StorageLocation" TEXT,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Inventories" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Notifications" (
        "Id" INTEGER NOT NULL,
        "Title" TEXT NOT NULL,
        "Message" TEXT NOT NULL,
        "Category" INTEGER NOT NULL,
        "Priority" INTEGER NOT NULL,
        "IsRead" INTEGER NOT NULL,
        "UserId" TEXT,
        "LinkUrl" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "PalmProcessings" (
        "Id" INTEGER NOT NULL,
        "ProcessingId" TEXT NOT NULL,
        "ProcessingDate" TEXT NOT NULL,
        "RawFruitKg" TEXT NOT NULL,
        "PalmOilLitres" TEXT NOT NULL,
        "ProcessingCost" TEXT NOT NULL,
        "LaborCost" TEXT NOT NULL,
        "FuelCost" TEXT NOT NULL,
        "WasteKg" TEXT NOT NULL,
        "YieldPercentage" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_PalmProcessings" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Plantations" (
        "Id" INTEGER NOT NULL,
        "PlantationId" TEXT NOT NULL,
        "Name" TEXT NOT NULL,
        "Location" TEXT NOT NULL,
        "TotalAreaHectares" TEXT NOT NULL,
        "NumberOfTrees" INTEGER NOT NULL,
        "PlantingDate" TEXT NOT NULL,
        "PalmVariety" TEXT,
        "Status" INTEGER NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Plantations" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Suppliers" (
        "Id" INTEGER NOT NULL,
        "SupplierId" TEXT NOT NULL,
        "Name" TEXT NOT NULL,
        "ContactPerson" TEXT,
        "Phone" TEXT,
        "Email" TEXT,
        "Address" TEXT,
        "ProductsServices" TEXT,
        "OutstandingBalance" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Suppliers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "WeeklyReports" (
        "Id" INTEGER NOT NULL,
        "ReportId" TEXT NOT NULL,
        "WeekStart" TEXT NOT NULL,
        "WeekEnd" TEXT NOT NULL,
        "WeekLabel" TEXT NOT NULL,
        "PalmFruitHarvestedKg" TEXT NOT NULL,
        "PalmOilProducedLitres" TEXT NOT NULL,
        "PalmOilSoldLitres" TEXT NOT NULL,
        "PalmOilRemainingLitres" TEXT NOT NULL,
        "PalmProductionCost" TEXT NOT NULL,
        "PalmSalesRevenue" TEXT NOT NULL,
        "PalmYieldPercentage" TEXT NOT NULL,
        "TotalCattle" INTEGER NOT NULL,
        "NewCattle" INTEGER NOT NULL,
        "CattleSold" INTEGER NOT NULL,
        "FeedingExpenses" TEXT NOT NULL,
        "VeterinaryExpenses" TEXT NOT NULL,
        "AverageWeightKg" TEXT NOT NULL,
        "HealthAlerts" INTEGER NOT NULL,
        "TotalRevenue" TEXT NOT NULL,
        "TotalExpenses" TEXT NOT NULL,
        "SalaryExpenses" TEXT NOT NULL,
        "NetProfit" TEXT NOT NULL,
        "ProfitMarginPercent" TEXT NOT NULL,
        "IsGenerated" INTEGER NOT NULL,
        "GeneratedAt" TEXT NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_WeeklyReports" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetRoleClaims" (
        "Id" INTEGER NOT NULL,
        "RoleId" TEXT NOT NULL,
        "ClaimType" TEXT,
        "ClaimValue" TEXT,
        CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetUserClaims" (
        "Id" INTEGER NOT NULL,
        "UserId" TEXT NOT NULL,
        "ClaimType" TEXT,
        "ClaimValue" TEXT,
        CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetUserLogins" (
        "LoginProvider" TEXT NOT NULL,
        "ProviderKey" TEXT NOT NULL,
        "ProviderDisplayName" TEXT,
        "UserId" TEXT NOT NULL,
        CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
        CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetUserRoles" (
        "UserId" TEXT NOT NULL,
        "RoleId" TEXT NOT NULL,
        CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"),
        CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "AspNetUserTokens" (
        "UserId" TEXT NOT NULL,
        "LoginProvider" TEXT NOT NULL,
        "Name" TEXT NOT NULL,
        "Value" TEXT,
        CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
        CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattleFeedings" (
        "Id" INTEGER NOT NULL,
        "CattleId" INTEGER,
        "GroupName" TEXT,
        "FeedingDate" TEXT NOT NULL,
        "FeedType" TEXT NOT NULL,
        "QuantityKg" TEXT NOT NULL,
        "Cost" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattleFeedings" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattleFeedings_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattleHealthRecords" (
        "Id" INTEGER NOT NULL,
        "CattleId" INTEGER NOT NULL,
        "RecordDate" TEXT NOT NULL,
        "Condition" TEXT NOT NULL,
        "Treatment" TEXT,
        "Medication" TEXT,
        "TreatmentCost" TEXT NOT NULL,
        "VeterinaryName" TEXT,
        "FollowUpDate" TEXT,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattleHealthRecords" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattleHealthRecords_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattleVaccinations" (
        "Id" INTEGER NOT NULL,
        "CattleId" INTEGER NOT NULL,
        "VaccineName" TEXT NOT NULL,
        "VaccinationDate" TEXT NOT NULL,
        "NextDueDate" TEXT,
        "AdministeredBy" TEXT,
        "Cost" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattleVaccinations" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattleVaccinations_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattleWeightRecords" (
        "Id" INTEGER NOT NULL,
        "CattleId" INTEGER NOT NULL,
        "RecordDate" TEXT NOT NULL,
        "WeightKg" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattleWeightRecords" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattleWeightRecords_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattleSales" (
        "Id" INTEGER NOT NULL,
        "SaleId" TEXT NOT NULL,
        "CattleId" INTEGER NOT NULL,
        "CustomerId" INTEGER,
        "CustomerName" TEXT NOT NULL,
        "SaleDate" TEXT NOT NULL,
        "SalePrice" TEXT NOT NULL,
        "WeightAtSaleKg" TEXT NOT NULL,
        "PaymentStatus" INTEGER NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattleSales" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattleSales_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_CattleSales_Customers_CustomerId" FOREIGN KEY ("CustomerId") REFERENCES "Customers" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Sales" (
        "Id" INTEGER NOT NULL,
        "InvoiceId" TEXT NOT NULL,
        "CustomerId" INTEGER,
        "CustomerName" TEXT NOT NULL,
        "Product" TEXT NOT NULL,
        "QuantityLitres" TEXT NOT NULL,
        "UnitPrice" TEXT NOT NULL,
        "TotalPrice" TEXT NOT NULL,
        "PaymentMethod" INTEGER NOT NULL,
        "PaymentStatus" INTEGER NOT NULL,
        "SaleDate" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Sales" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Sales_Customers_CustomerId" FOREIGN KEY ("CustomerId") REFERENCES "Customers" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Expenses" (
        "Id" INTEGER NOT NULL,
        "ExpenseId" TEXT NOT NULL,
        "Category" TEXT NOT NULL,
        "Division" INTEGER NOT NULL,
        "Description" TEXT NOT NULL,
        "Amount" TEXT NOT NULL,
        "Date" TEXT NOT NULL,
        "PaymentMethod" INTEGER NOT NULL,
        "EmployeeId" INTEGER,
        "SalaryId" INTEGER,
        "ReceiptPath" TEXT,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Expenses" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Expenses_Employees_EmployeeId" FOREIGN KEY ("EmployeeId") REFERENCES "Employees" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "Salaries" (
        "Id" INTEGER NOT NULL,
        "EmployeeId" INTEGER NOT NULL,
        "Amount" TEXT NOT NULL,
        "Period" TEXT NOT NULL,
        "PeriodStart" TEXT NOT NULL,
        "PeriodEnd" TEXT NOT NULL,
        "PaymentDate" TEXT,
        "Status" INTEGER NOT NULL,
        "PaymentMethod" INTEGER NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Salaries" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Salaries_Employees_EmployeeId" FOREIGN KEY ("EmployeeId") REFERENCES "Employees" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "StockTransactions" (
        "Id" INTEGER NOT NULL,
        "InventoryId" INTEGER NOT NULL,
        "TransactionType" INTEGER NOT NULL,
        "Quantity" TEXT NOT NULL,
        "BalanceAfter" TEXT NOT NULL,
        "ReferenceId" TEXT,
        "Description" TEXT,
        "TransactionDate" TEXT NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_StockTransactions" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_StockTransactions_Inventories_InventoryId" FOREIGN KEY ("InventoryId") REFERENCES "Inventories" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "PalmOilBatches" (
        "Id" INTEGER NOT NULL,
        "BatchId" TEXT NOT NULL,
        "ProcessingId" INTEGER NOT NULL,
        "ProductionDate" TEXT NOT NULL,
        "QuantityLitres" TEXT NOT NULL,
        "RemainingLitres" TEXT NOT NULL,
        "StorageLocation" TEXT,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_PalmOilBatches" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PalmOilBatches_PalmProcessings_ProcessingId" FOREIGN KEY ("ProcessingId") REFERENCES "PalmProcessings" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "PalmBlocks" (
        "Id" INTEGER NOT NULL,
        "BlockId" TEXT NOT NULL,
        "Name" TEXT NOT NULL,
        "PlantationId" INTEGER NOT NULL,
        "AreaHectares" TEXT NOT NULL,
        "NumberOfTrees" INTEGER NOT NULL,
        "PlantingDate" TEXT NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_PalmBlocks" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PalmBlocks_Plantations_PlantationId" FOREIGN KEY ("PlantationId") REFERENCES "Plantations" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "CattlePurchases" (
        "Id" INTEGER NOT NULL,
        "PurchaseId" TEXT NOT NULL,
        "CattleId" INTEGER NOT NULL,
        "SupplierId" INTEGER,
        "SupplierName" TEXT NOT NULL,
        "PurchaseDate" TEXT NOT NULL,
        "PurchasePrice" TEXT NOT NULL,
        "WeightAtPurchaseKg" TEXT NOT NULL,
        "PaymentStatus" INTEGER NOT NULL,
        "Notes" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_CattlePurchases" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_CattlePurchases_Cattle_CattleId" FOREIGN KEY ("CattleId") REFERENCES "Cattle" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_CattlePurchases_Suppliers_SupplierId" FOREIGN KEY ("SupplierId") REFERENCES "Suppliers" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE TABLE "PalmHarvests" (
        "Id" INTEGER NOT NULL,
        "HarvestId" TEXT NOT NULL,
        "PlantationId" INTEGER NOT NULL,
        "PalmBlockId" INTEGER,
        "HarvestDate" TEXT NOT NULL,
        "NumberOfBunches" INTEGER NOT NULL,
        "TotalWeightKg" TEXT NOT NULL,
        "HarvestTeam" TEXT,
        "LaborCost" TEXT NOT NULL,
        "Notes" TEXT,
        "IsProcessed" INTEGER NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_PalmHarvests" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PalmHarvests_PalmBlocks_PalmBlockId" FOREIGN KEY ("PalmBlockId") REFERENCES "PalmBlocks" ("Id"),
        CONSTRAINT "FK_PalmHarvests_Plantations_PlantationId" FOREIGN KEY ("PlantationId") REFERENCES "Plantations" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleFeedings_CattleId" ON "CattleFeedings" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleHealthRecords_CattleId" ON "CattleHealthRecords" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattlePurchases_CattleId" ON "CattlePurchases" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattlePurchases_SupplierId" ON "CattlePurchases" ("SupplierId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleSales_CattleId" ON "CattleSales" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleSales_CustomerId" ON "CattleSales" ("CustomerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleVaccinations_CattleId" ON "CattleVaccinations" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_CattleWeightRecords_CattleId" ON "CattleWeightRecords" ("CattleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_Expenses_EmployeeId" ON "Expenses" ("EmployeeId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_PalmBlocks_PlantationId" ON "PalmBlocks" ("PlantationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_PalmHarvests_PalmBlockId" ON "PalmHarvests" ("PalmBlockId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_PalmHarvests_PlantationId" ON "PalmHarvests" ("PlantationId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_PalmOilBatches_ProcessingId" ON "PalmOilBatches" ("ProcessingId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_Salaries_EmployeeId" ON "Salaries" ("EmployeeId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_Sales_CustomerId" ON "Sales" ("CustomerId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    CREATE INDEX "IX_StockTransactions_InventoryId" ON "StockTransactions" ("InventoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260813153656_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260813153656_InitialCreate', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260814102710_AddProduction') THEN
    CREATE TABLE "Productions" (
        "Id" INTEGER NOT NULL,
        "Date" TEXT NOT NULL,
        "Category" TEXT NOT NULL,
        "Item" TEXT NOT NULL,
        "Quantity" TEXT NOT NULL,
        "Unit" TEXT NOT NULL,
        "Cost" TEXT NOT NULL,
        "Description" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_Productions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260814102710_AddProduction') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260814102710_AddProduction', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260815150734_AddDailyOperations') THEN
    CREATE TABLE "DailyOperations" (
        "Id" INTEGER NOT NULL,
        "Date" TEXT NOT NULL,
        "OperationType" TEXT NOT NULL,
        "Description" TEXT NOT NULL,
        "PerformedBy" TEXT NOT NULL,
        "PlantationId" TEXT,
        "PalmBlockId" TEXT,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "IsDeleted" INTEGER NOT NULL,
        CONSTRAINT "PK_DailyOperations" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260815150734_AddDailyOperations') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260815150734_AddDailyOperations', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817122038_AddDailyOperation') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260817122038_AddDailyOperation', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    ALTER TABLE "Sales" ADD "CustomerAddress" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    ALTER TABLE "Sales" ADD "CustomerEmail" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    ALTER TABLE "Sales" ADD "CustomerPhone" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    ALTER TABLE "Sales" ADD "CustomerType" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    ALTER TABLE "Sales" ADD "SellerName" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260818141554_AddSaleCustomerFields') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260818141554_AddSaleCustomerFields', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260820081835_AddPayrollReceiptNumber') THEN
    ALTER TABLE "Salaries" ADD "ReceiptNumber" TEXT NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260820081835_AddPayrollReceiptNumber') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260820081835_AddPayrollReceiptNumber', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260820110004_AddPalmHarvestPlantations') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260820110004_AddPalmHarvestPlantations', '9.0.7');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260820121638_AddSeedDataEnabled') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260820121638_AddSeedDataEnabled', '9.0.7');
    END IF;
END $EF$;
COMMIT;

-- Existing EF migrations were originally created for SQLite. Normalize
-- integer-backed boolean columns before seeding when deploying manually.
DO $$
DECLARE column_record record;
BEGIN
    FOR column_record IN
                SELECT c.table_name, c.column_name
                FROM information_schema.columns c
                WHERE c.table_schema = 'public'
                    AND c.data_type = 'integer'
          AND (
              column_name LIKE 'Is%'
              OR column_name LIKE '%Confirmed'
              OR column_name LIKE '%Enabled'
          )
    LOOP
        EXECUTE format(
            'ALTER TABLE %I ALTER COLUMN %I TYPE boolean USING %I <> 0',
            column_record.table_name,
            column_record.column_name,
            column_record.column_name);
    END LOOP;
END $$;

DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260822090000_AddSheepAndCattleCategories') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Cattle' AND column_name = 'Breed') THEN
            ALTER TABLE "Cattle" RENAME COLUMN "Breed" TO "Category";
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Cattle' AND column_name = 'Remarks') THEN
            ALTER TABLE "Cattle" ADD "Remarks" TEXT;
        END IF;
        CREATE TABLE IF NOT EXISTS "Sheep" (
            "Id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "SheepId" TEXT NOT NULL,
            "TagNumber" TEXT,
            "Name" TEXT,
            "Sex" TEXT NOT NULL,
            "DateOfBirth" TEXT NOT NULL,
            "AcquisitionDate" TEXT NOT NULL,
            "AcquisitionCost" TEXT NOT NULL,
            "CurrentWeightKg" TEXT NOT NULL,
            "Location" TEXT,
            "Remarks" TEXT,
            "CreatedAt" TEXT NOT NULL,
            "UpdatedAt" TEXT NOT NULL,
            "IsDeleted" BOOLEAN NOT NULL
        );
        INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES ('20260822090000_AddSheepAndCattleCategories', '9.0.7');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260821120000_AddSalaryExpenseLink') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'Expenses' AND column_name = 'SalaryId'
        ) THEN
            ALTER TABLE "Expenses" ADD "SalaryId" INTEGER;
        END IF;
        CREATE UNIQUE INDEX IF NOT EXISTS "IX_Expenses_SalaryId" ON "Expenses" ("SalaryId") WHERE "SalaryId" IS NOT NULL;
        INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
        VALUES ('20260821120000_AddSalaryExpenseLink', '9.0.7');
    END IF;
END $$;

DO $$
DECLARE key_record record;
BEGIN
        FOR key_record IN
                SELECT tc.table_name, kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
                JOIN information_schema.columns c
                    ON c.table_schema = kcu.table_schema
                 AND c.table_name = kcu.table_name
                 AND c.column_name = kcu.column_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = 'public'
                    AND c.data_type = 'integer'
                    AND c.column_default IS NULL
                      AND c.is_identity = 'NO'
        LOOP
                EXECUTE format(
                        'ALTER TABLE %I ALTER COLUMN %I ADD GENERATED BY DEFAULT AS IDENTITY',
                        key_record.table_name,
                        key_record.column_name);
        END LOOP;
END $$;

