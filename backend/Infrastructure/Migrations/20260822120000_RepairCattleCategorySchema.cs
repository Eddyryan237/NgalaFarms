using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NgalaFarms.Infrastructure.Migrations;

[Migration("20260822120000_RepairCattleCategorySchema")]
public partial class RepairCattleCategorySchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'Cattle' AND column_name = 'Category') THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Cattle' AND column_name = 'Breed') THEN
                        ALTER TABLE "Cattle" RENAME COLUMN "Breed" TO "Category";
                    ELSE
                        ALTER TABLE "Cattle" ADD COLUMN "Category" text NOT NULL DEFAULT '';
                    END IF;
                END IF;
            END $$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}