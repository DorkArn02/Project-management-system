using Microsoft.EntityFrameworkCore;

namespace Szakdolgozat_backend.Models;

public partial class DbCustomContext : DbContext
{
    // Scaffold-DbContext "Server=localhost;Database=DB_TESZT;Integrated Security=true;Encrypt=false;"  Microsoft.EntityFrameworkCore.SqlServer
    public DbCustomContext()
    {
    }

    public DbCustomContext(DbContextOptions<DbCustomContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AssignedPerson> AssignedPeople { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<Priority> Priorities { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectList> ProjectLists { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }
}
