using LoPartidet.API.Entities;
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

            entity.HasOne(m => m.CreatedBy)
                  .WithMany()
                  .HasForeignKey(m => m.CreatedById);
        });
    }
}
