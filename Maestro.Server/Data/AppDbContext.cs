using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DuzeyYardimSistemi.Server.Models;

namespace DuzeyYardimSistemi.Server.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketStatus> TicketStatuses { get; set; }
        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<TicketHistory> TicketHistories { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<SlaPolicy> SlaPolicies { get; set; }
        public DbSet<WorkingHourConfig> WorkingHourConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Additional configurations if needed
            builder.Entity<Ticket>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Tickets)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TicketStatus>()
                .HasOne(s => s.Project)
                .WithMany(p => p.WebStatuses)
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Project Members M2M
            builder.Entity<Project>()
                .HasMany(p => p.Members)
                .WithMany(u => u.Projects)
                .UsingEntity(j => j.ToTable("ProjectMembers"));
        }
    }
}
