using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddVehiclesPets_20260511102456 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "pets",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    breed = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    color = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    age = table.Column<int>(type: "int", nullable: true),
                    gender = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    vaccinated = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    microchip = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    neutered = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    temperament = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    photo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    owner_name = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    registered_date = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pets", x => x.id);
                });

            // Only create new tables (pets and vehicles). Existing tables (posts/replies/userAccounts)
            // already exist in the target database and should not be recreated here.
            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    type = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    category = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    plate_number = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    color = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    brand = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    model = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    year = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    vin = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    guest_name = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    guest_contact = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    guest_duration = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    guest_duration_type = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    owner_name = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    registered_date = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Only drop the tables that this migration created.
            migrationBuilder.DropTable(
                name: "pets");

            migrationBuilder.DropTable(
                name: "vehicles");
        }
    }
}
