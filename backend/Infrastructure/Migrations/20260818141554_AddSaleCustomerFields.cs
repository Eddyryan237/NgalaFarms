using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleCustomerFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerAddress",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerType",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SellerName",
                table: "Sales",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerAddress",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CustomerType",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "SellerName",
                table: "Sales");
        }
    }
}
