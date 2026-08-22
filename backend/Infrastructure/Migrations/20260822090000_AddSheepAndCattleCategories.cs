using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations;

public partial class AddSheepAndCattleCategories : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.RenameColumn("Breed", "Cattle", "Category");
        migrationBuilder.AddColumn<string>("Remarks", "Cattle", type: "TEXT", nullable: true);
        migrationBuilder.CreateTable("Sheep", table => new
        {
            Id = table.Column<int>(type: "INTEGER", nullable: false).Annotation("Sqlite:Autoincrement", true),
            SheepId = table.Column<string>(type: "TEXT", nullable: false), TagNumber = table.Column<string>(type: "TEXT", nullable: true), Name = table.Column<string>(type: "TEXT", nullable: true), Sex = table.Column<string>(type: "TEXT", nullable: false), DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false), AcquisitionDate = table.Column<DateTime>(type: "TEXT", nullable: false), AcquisitionCost = table.Column<decimal>(type: "TEXT", nullable: false), CurrentWeightKg = table.Column<decimal>(type: "TEXT", nullable: false), Location = table.Column<string>(type: "TEXT", nullable: true), Remarks = table.Column<string>(type: "TEXT", nullable: true), CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false), UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false), IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
        }, constraints: table => table.PrimaryKey("PK_Sheep", x => x.Id));
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("Sheep");
        migrationBuilder.DropColumn("Remarks", "Cattle");
        migrationBuilder.RenameColumn("Category", "Cattle", "Breed");
    }
}