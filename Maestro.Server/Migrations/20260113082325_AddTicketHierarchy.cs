using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DuzeyYardimSistemi.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_ParentId",
                table: "Tickets",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets",
                column: "ParentId",
                principalTable: "Tickets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Tickets_ParentId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_ParentId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Tickets");
        }
    }
}
