namespace Szakdolgozat_backend.Models;

public partial class AuditLog
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public DateTime Created { get; set; }

    public string Content { get; set; } = null!;

    public Guid ProjectId { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
