using Microsoft.EntityFrameworkCore.Migrations;

namespace WebApplication1.Migrations
{
    public partial class AddVehiclesPets_20260511 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(maxLength: 50, nullable: true),
                    category = table.Column<string>(maxLength: 50, nullable: true),
                    plate_number = table.Column<string>(maxLength: 50, nullable: true),
                    color = table.Column<string>(maxLength: 50, nullable: true),
                    brand = table.Column<string>(maxLength: 100, nullable: true),
                    model = table.Column<string>(maxLength: 100, nullable: true),
                    year = table.Column<string>(maxLength: 10, nullable: true),
                    vin = table.Column<string>(maxLength: 100, nullable: true),
                    notes = table.Column<string>(nullable: true),
                    guest_name = table.Column<string>(maxLength: 200, nullable: true),
                    guest_contact = table.Column<string>(maxLength: 50, nullable: true),
                    guest_duration = table.Column<string>(maxLength: 50, nullable: true),
                    guest_duration_type = table.Column<string>(maxLength: 20, nullable: true),
                    owner_name = table.Column<string>(maxLength: 200, nullable: true),
                    registered_date = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "pets",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(maxLength: 50, nullable: true),
                    breed = table.Column<string>(maxLength: 100, nullable: true),
                    name = table.Column<string>(maxLength: 100, nullable: true),
                    color = table.Column<string>(maxLength: 100, nullable: true),
                    age = table.Column<int>(nullable: true),
                    gender = table.Column<string>(maxLength: 20, nullable: true),
                    vaccinated = table.Column<string>(maxLength: 20, nullable: true),
                    microchip = table.Column<string>(maxLength: 20, nullable: true),
                    neutered = table.Column<string>(maxLength: 20, nullable: true),
                    temperament = table.Column<string>(maxLength: 100, nullable: true),
                    notes = table.Column<string>(nullable: true),
                    photo = table.Column<string>(nullable: true),
                    owner_name = table.Column<string>(maxLength: 200, nullable: true),
                    registered_date = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pets", x => x.id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "vehicles");
            migrationBuilder.DropTable(name: "pets");
        }
    }
}
