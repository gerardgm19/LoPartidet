using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTable_Matches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: "1");

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: "2");

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: "3");

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: "4");

            migrationBuilder.DeleteData(
                table: "Matches",
                keyColumn: "Id",
                keyValue: "5");

            migrationBuilder.DropColumn(
                name: "FootballType",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "IsJoined",
                table: "Matches");

            migrationBuilder.RenameColumn(
                name: "Organizer",
                table: "Matches",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "MaxPeople",
                table: "Matches",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "JoinedCount",
                table: "Matches",
                newName: "MaxPlayers");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Matches",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Matches");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Matches",
                newName: "MaxPeople");

            migrationBuilder.RenameColumn(
                name: "MaxPlayers",
                table: "Matches",
                newName: "JoinedCount");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Matches",
                newName: "Organizer");

            migrationBuilder.AddColumn<int>(
                name: "FootballType",
                table: "Matches",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsJoined",
                table: "Matches",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
