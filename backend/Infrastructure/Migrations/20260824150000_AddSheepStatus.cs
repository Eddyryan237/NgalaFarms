using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations;

public partial class AddSheepStatus : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Status",
            table: "Sheep",
            type: "text",
            nullable: false,
            defaultValue: "Active");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "Status", table: "Sheep");
    }
}