using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql(@"
                INSERT INTO `Locations` (`Name`)
                SELECT MIN(name) FROM (
                    SELECT TRIM(`Location`) AS name FROM `Matches` WHERE `Location` IS NOT NULL AND TRIM(`Location`) <> ''
                    UNION
                    SELECT TRIM(`Location`) AS name FROM `TournamentMatches` WHERE `Location` IS NOT NULL AND TRIM(`Location`) <> ''
                ) AS combined
                GROUP BY LOWER(name);
            ");

            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "TournamentMatches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE `Matches` m
                JOIN `Locations` l ON LOWER(TRIM(m.`Location`)) = LOWER(l.`Name`)
                SET m.`LocationId` = l.`Id`
                WHERE m.`Location` IS NOT NULL AND TRIM(m.`Location`) <> '';
            ");

            migrationBuilder.Sql(@"
                UPDATE `TournamentMatches` tm
                JOIN `Locations` l ON LOWER(TRIM(tm.`Location`)) = LOWER(l.`Name`)
                SET tm.`LocationId` = l.`Id`
                WHERE tm.`Location` IS NOT NULL AND TRIM(tm.`Location`) <> '';
            ");

            migrationBuilder.Sql(@"
                INSERT INTO `Locations` (`Name`) VALUES ('Unknown');
                UPDATE `Matches` SET `LocationId` = (SELECT `Id` FROM `Locations` WHERE `Name` = 'Unknown' ORDER BY `Id` DESC LIMIT 1) WHERE `LocationId` IS NULL;
                UPDATE `TournamentMatches` SET `LocationId` = (SELECT `Id` FROM `Locations` WHERE `Name` = 'Unknown' ORDER BY `Id` DESC LIMIT 1) WHERE `LocationId` IS NULL;
                DELETE FROM `Locations` WHERE `Name` = 'Unknown' AND `Id` NOT IN (SELECT DISTINCT `LocationId` FROM `Matches`) AND `Id` NOT IN (SELECT DISTINCT `LocationId` FROM `TournamentMatches`);
            ");

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "TournamentMatches",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "LocationId",
                table: "Matches",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Location",
                table: "TournamentMatches");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Matches");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatches_LocationId",
                table: "TournamentMatches",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_LocationId",
                table: "Matches",
                column: "LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Locations_LocationId",
                table: "Matches",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentMatches_Locations_LocationId",
                table: "TournamentMatches",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "TournamentMatches",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Matches",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql(@"
                UPDATE `Matches` m
                JOIN `Locations` l ON m.`LocationId` = l.`Id`
                SET m.`Location` = l.`Name`;
            ");

            migrationBuilder.Sql(@"
                UPDATE `TournamentMatches` tm
                JOIN `Locations` l ON tm.`LocationId` = l.`Id`
                SET tm.`Location` = l.`Name`;
            ");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Locations_LocationId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_TournamentMatches_Locations_LocationId",
                table: "TournamentMatches");

            migrationBuilder.DropIndex(
                name: "IX_TournamentMatches_LocationId",
                table: "TournamentMatches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_LocationId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "TournamentMatches");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "Matches");

            migrationBuilder.DropTable(
                name: "Locations");
        }
    }
}
