using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WebApplication1.Migrations
{
    [DbContext(typeof(WebApplication1.Models.SqBelAir4Context))]
    [Migration("20260511000000_InitialBaseline")]
    public partial class InitialBaseline : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Intentionally empty baseline migration to mark existing schema as applied.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op
        }
    }
}