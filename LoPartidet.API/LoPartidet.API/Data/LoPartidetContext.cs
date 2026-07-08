using LoPartidet.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Data;

public class LoPartidetContext(DbContextOptions<LoPartidetContext> options) : DbContext(options)
{
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserMatch> UserMatches => Set<UserMatch>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<PlayerSkill> PlayerSkills => Set<PlayerSkill>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<TournamentGroup> TournamentGroups => Set<TournamentGroup>();
    public DbSet<TournamentMatch> TournamentMatches => Set<TournamentMatch>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<MatchEvent> MatchEvents => Set<MatchEvent>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<TournamentLocation> TournamentLocations => Set<TournamentLocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserMatch>(entity =>
        {
            entity.HasKey(um => new { um.UserId, um.MatchId });

            entity.HasOne(um => um.User)
                  .WithMany(u => u.UserMatches)
                  .HasForeignKey(um => um.UserId);

            entity.HasOne(um => um.Match)
                  .WithMany(m => m.JoinedUsers)
                  .HasForeignKey(um => um.MatchId);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(ur => new { ur.UserId, ur.Role });

            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(ur => ur.UserId);
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

        modelBuilder.Entity<PlayerSkill>(entity =>
        {
            entity.HasKey(ps => ps.Id);

            entity.HasOne(ps => ps.User)
                  .WithMany(u => u.PlayerSkills)
                  .HasForeignKey(ps => ps.UserId);
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<TournamentLocation>(entity =>
        {
            entity.HasKey(tl => tl.Id);

            entity.HasOne(tl => tl.Tournament)
                  .WithMany(t => t.Locations)
                  .HasForeignKey(tl => tl.TournamentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tl => tl.Location)
                  .WithMany()
                  .HasForeignKey(tl => tl.LocationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.HasOne(m => m.CreatedBy)
                  .WithMany()
                  .HasForeignKey(m => m.CreatedById);

            entity.HasOne(m => m.Location)
                  .WithMany()
                  .HasForeignKey(m => m.LocationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Tournament>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).HasMaxLength(150);

            entity.HasOne(t => t.CreatedBy)
                  .WithMany()
                  .HasForeignKey(t => t.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TournamentGroup>(entity =>
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.Name).HasMaxLength(50);

            entity.HasOne(g => g.Tournament)
                  .WithMany(t => t.Groups)
                  .HasForeignKey(g => g.TournamentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TournamentMatch>(entity =>
        {
            entity.HasKey(tm => tm.Id);

            entity.HasOne(tm => tm.TournamentLocation)
                  .WithMany(tl => tl.Matches)
                  .HasForeignKey(tm => tm.TournamentLocationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tm => tm.CreatedBy)
                  .WithMany()
                  .HasForeignKey(tm => tm.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tm => tm.Tournament)
                  .WithMany(t => t.Matches)
                  .HasForeignKey(tm => tm.TournamentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tm => tm.Group)
                  .WithMany(g => g.Matches)
                  .HasForeignKey(tm => tm.GroupId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tm => tm.TeamA)
                  .WithMany()
                  .HasForeignKey(tm => tm.TeamAId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tm => tm.TeamB)
                  .WithMany()
                  .HasForeignKey(tm => tm.TeamBId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tm => tm.Referee)
                  .WithMany()
                  .HasForeignKey(tm => tm.RefereeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).HasMaxLength(100);

            entity.HasOne(t => t.Tournament)
                  .WithMany(tour => tour.Teams)
                  .HasForeignKey(t => t.TournamentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Group)
                  .WithMany(g => g.Teams)
                  .HasForeignKey(t => t.GroupId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.CreatedBy)
                  .WithMany()
                  .HasForeignKey(t => t.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(tm => tm.Id);

            entity.HasOne(tm => tm.Team)
                  .WithMany(t => t.Members)
                  .HasForeignKey(tm => tm.TeamId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tm => tm.User)
                  .WithMany()
                  .HasForeignKey(tm => tm.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MatchEvent>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Match)
                  .WithMany(m => m.Events)
                  .HasForeignKey(e => e.MatchId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Team)
                  .WithMany()
                  .HasForeignKey(e => e.TeamId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Referee)
                  .WithMany()
                  .HasForeignKey(e => e.RefereeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
