using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangeTournamentMatchLocationToTournamentLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TournamentMatches_Locations_LocationId",
                table: "TournamentMatches");

            migrationBuilder.RenameColumn(
                name: "LocationId",
                table: "TournamentMatches",
                newName: "TournamentLocationId");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentMatches_LocationId",
                table: "TournamentMatches",
                newName: "IX_TournamentMatches_TournamentLocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentMatches_TournamentLocations_TournamentLocationId",
                table: "TournamentMatches",
                column: "TournamentLocationId",
                principalTable: "TournamentLocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TournamentMatches_TournamentLocations_TournamentLocationId",
                table: "TournamentMatches");

            migrationBuilder.RenameColumn(
                name: "TournamentLocationId",
                table: "TournamentMatches",
                newName: "LocationId");

            migrationBuilder.RenameIndex(
                name: "IX_TournamentMatches_TournamentLocationId",
                table: "TournamentMatches",
                newName: "IX_TournamentMatches_LocationId");

            migrationBuilder.AddForeignKey(
                name: "FK_TournamentMatches_Locations_LocationId",
                table: "TournamentMatches",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
