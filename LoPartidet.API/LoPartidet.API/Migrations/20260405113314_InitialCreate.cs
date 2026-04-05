using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FootballType = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Organizer = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    JoinedCount = table.Column<int>(type: "int", nullable: false),
                    MaxPeople = table.Column<int>(type: "int", nullable: false),
                    IsJoined = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Matches",
                columns: new[] { "Id", "Date", "FootballType", "IsJoined", "JoinedCount", "Location", "MaxPeople", "Organizer", "Status" },
                values: new object[,]
                {
                    { "1", new DateTime(2026, 4, 10, 20, 0, 0, 0, DateTimeKind.Utc), 1, true, 11, "Poliesportiu Les Corts, Barcelona", 14, "Marc Ribas", 0 },
                    { "2", new DateTime(2026, 4, 8, 19, 45, 0, 0, DateTimeKind.Utc), 0, true, 10, "Pista Municipal Nord, Madrid", 10, "Luis Herrera", 1 },
                    { "3", new DateTime(2026, 4, 6, 17, 30, 0, 0, DateTimeKind.Utc), 3, false, 12, "Pavelló Can Zam, Santa Coloma", 12, "Jordi Puig", 2 },
                    { "4", new DateTime(2026, 4, 12, 11, 0, 0, 0, DateTimeKind.Utc), 2, false, 14, "Camp Municipal de Futbol, Badalona", 22, "Sergio Mora", 0 },
                    { "5", new DateTime(2026, 4, 13, 10, 30, 0, 0, DateTimeKind.Utc), 4, true, 8, "Platja de la Barceloneta, Barcelona", 10, "Alex Font", 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Matches");
        }
    }
}
