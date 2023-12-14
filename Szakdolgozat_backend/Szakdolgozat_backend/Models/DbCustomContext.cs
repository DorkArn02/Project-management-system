using Microsoft.EntityFrameworkCore;

namespace Szakdolgozat_backend.Models;

public partial class DbCustomContext : DbContext
{
    // Scaffold-DbContext "Server=localhost;Database=DB_ELES_2;Integrated Security=true;Encrypt=false;" -OutputDir "Models2"  Microsoft.EntityFrameworkCore.SqlServer
    public DbCustomContext()
    {
    }

    public DbCustomContext(DbContextOptions<DbCustomContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>()
            .HasOne(d => d.Modifier).WithMany(p => p.NotificationModifiers)
                .HasForeignKey(d => d.ModifierId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__notificat__Modif__1F63A897");
        modelBuilder.Entity<Notification>().HasOne(d => d.User).WithMany(p => p.NotificationUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__notificat__UserI__1E6F845E");
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }
    public virtual DbSet<AssignedPerson> AssignedPeople { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<Priority> Priorities { get; set; }

    public virtual DbSet<Project> Projects { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<ProjectList> ProjectLists { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<IssueType> IssueTypes { get; set; }
}
