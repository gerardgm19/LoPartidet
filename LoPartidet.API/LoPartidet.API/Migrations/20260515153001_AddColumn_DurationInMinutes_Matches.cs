using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class AddColumn_DurationInMinutes_Matches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DurationInMinutes",
                table: "Matches",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationInMinutes",
                table: "Matches");
        }
    }
}
