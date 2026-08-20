using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPalmHarvestPlantations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PlantationIds",
                table: "PalmHarvests",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlantationIds",
                table: "PalmHarvests");
        }
    }
}
