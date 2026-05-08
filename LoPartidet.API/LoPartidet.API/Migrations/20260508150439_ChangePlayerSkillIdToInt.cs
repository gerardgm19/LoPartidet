using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangePlayerSkillIdToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayerSkills",
                table: "PlayerSkills");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "PlayerSkills");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "PlayerSkills",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayerSkills",
                table: "PlayerSkills",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayerSkills",
                table: "PlayerSkills");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "PlayerSkills");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "PlayerSkills",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayerSkills",
                table: "PlayerSkills",
                column: "Id");
        }
    }
}
