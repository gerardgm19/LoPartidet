using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoPartidet.API.Migrations
{
    /// <inheritdoc />
    public partial class AddForeignKey_Match_CreatedById : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop CreatedBy (string) column if it still exists
            migrationBuilder.Sql(@"
                SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Matches' AND COLUMN_NAME = 'CreatedBy');
                SET @sql = IF(@col_exists > 0, 'ALTER TABLE Matches DROP COLUMN CreatedBy', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");

            // Add CreatedById (int) if it doesn't exist yet
            migrationBuilder.Sql(@"
                SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Matches' AND COLUMN_NAME = 'CreatedById');
                SET @sql = IF(@col_exists = 0, 'ALTER TABLE Matches ADD COLUMN CreatedById int NOT NULL DEFAULT 0', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");

            // Create index if it doesn't exist
            migrationBuilder.Sql(@"
                SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Matches' AND INDEX_NAME = 'IX_Matches_CreatedById');
                SET @sql = IF(@idx_exists = 0, 'CREATE INDEX IX_Matches_CreatedById ON Matches (CreatedById)', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");

            // Delete orphan rows before adding FK
            migrationBuilder.Sql("DELETE FROM UserMatches WHERE MatchId IN (SELECT Id FROM Matches WHERE CreatedById NOT IN (SELECT Id FROM Users));");
            migrationBuilder.Sql("DELETE FROM Matches WHERE CreatedById NOT IN (SELECT Id FROM Users);");

            // Add FK if it doesn't exist
            migrationBuilder.Sql(@"
                SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
                    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'Matches'
                    AND CONSTRAINT_NAME = 'FK_Matches_Users_CreatedById' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
                SET @sql = IF(@fk_exists = 0,
                    'ALTER TABLE Matches ADD CONSTRAINT FK_Matches_Users_CreatedById FOREIGN KEY (CreatedById) REFERENCES Users (Id) ON DELETE CASCADE',
                    'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Users_CreatedById",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_CreatedById",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Matches");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Matches",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
