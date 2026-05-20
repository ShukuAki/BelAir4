using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddKeywordDictionaryAndPriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add missing columns to concern_reports if they don't exist
            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "concern_reports",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: true,
                defaultValue: "medium");

            migrationBuilder.AddColumn<string>(
                name: "detected_keywords",
                table: "concern_reports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                table: "concern_reports",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "keyword_dictionary",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    keyword = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    severity = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    category = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    language = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeywordDictionary", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "priority",
                table: "concern_reports");

            migrationBuilder.DropColumn(
                name: "detected_keywords",
                table: "concern_reports");

            migrationBuilder.DropColumn(
                name: "is_public",
                table: "concern_reports");

            migrationBuilder.DropTable(
                name: "keyword_dictionary");
        }
    }
}
