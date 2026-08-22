using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations;

public partial class AddSalaryExpenseLink : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(name: "SalaryId", table: "Expenses", type: "INTEGER", nullable: true);
        migrationBuilder.CreateIndex(name: "IX_Expenses_SalaryId", table: "Expenses", column: "SalaryId", unique: true, filter: "\"SalaryId\" IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Expenses_SalaryId", table: "Expenses");
        migrationBuilder.DropColumn(name: "SalaryId", table: "Expenses");
    }
}