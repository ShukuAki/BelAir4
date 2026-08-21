using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSubscribers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notification_subscribers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    resident_name = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    email = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
                    device_info = table.Column<string>(type: "varchar(300)", unicode: false, maxLength: 300, nullable: true),
                    subscribed_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    unsubscribed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    last_notified_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    notifications_sent_count = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSubscribers", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "UX_NotificationSubscribers_Email",
                table: "notification_subscribers",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification_subscribers");
        }
    }
}
