using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Data;

public class LoPartidetContext(DbContextOptions<LoPartidetContext> options) : DbContext(options)
{
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserMatch> UserMatches => Set<UserMatch>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserMatch>(entity =>
        {
            entity.HasKey(um => new { um.UserId, um.MatchId });

            entity.HasOne(um => um.User)
                  .WithMany(u => u.UserMatches)
                  .HasForeignKey(um => um.UserId);

            entity.HasOne(um => um.Match)
                  .WithMany()
                  .HasForeignKey(um => um.MatchId);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).HasMaxLength(100);
            entity.Property(u => u.Surname).HasMaxLength(100);
            entity.Property(u => u.Nickname).HasMaxLength(50);
            entity.Property(u => u.Email).HasMaxLength(200);
            entity.Property(u => u.City).HasMaxLength(100);
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Location).HasMaxLength(200);
            entity.Property(m => m.CreatedById).HasMaxLength(100);

            //entity.HasData(
            //    new Match { Id = "1", Type = SportType.Fut7,   Date = new DateTime(2026, 4, 10, 20, 0,  0, DateTimeKind.Utc), Location = "Poliesportiu Les Corts, Barcelona",     Organizer = "Marc Ribas",   JoinedCount = 11, MaxPeople = 14, IsJoined = true,  Status = MatchStatus.Scheduled },
            //    new Match { Id = "2", Type = SportType.Fut5,   Date = new DateTime(2026, 4,  8, 19, 45, 0, DateTimeKind.Utc), Location = "Pista Municipal Nord, Madrid",          Organizer = "Luis Herrera", JoinedCount = 10, MaxPeople = 10, IsJoined = true,  Status = MatchStatus.Live      },
            //    new Match { Id = "3", Type = SportType.Futsal, Date = new DateTime(2026, 4,  6, 17, 30, 0, DateTimeKind.Utc), Location = "Pavelló Can Zam, Santa Coloma",         Organizer = "Jordi Puig",   JoinedCount = 12, MaxPeople = 12, IsJoined = false, Status = MatchStatus.Finished  },
            //    new Match { Id = "4", Type = SportType.Fut11,  Date = new DateTime(2026, 4, 12, 11, 0,  0, DateTimeKind.Utc), Location = "Camp Municipal de Futbol, Badalona",    Organizer = "Sergio Mora",  JoinedCount = 14, MaxPeople = 22, IsJoined = false, Status = MatchStatus.Scheduled },
            //    new Match { Id = "5", Type = SportType.Beach,  Date = new DateTime(2026, 4, 13, 10, 30, 0, DateTimeKind.Utc), Location = "Platja de la Barceloneta, Barcelona",   Organizer = "Alex Font",    JoinedCount = 8,  MaxPeople = 10, IsJoined = true,  Status = MatchStatus.Scheduled }
            //);
        });
    }
}
