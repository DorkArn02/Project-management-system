namespace Szakdolgozat_backend.Models;

public partial class Comment
{
    public Guid Id { get; set; }

    public string Content { get; set; } = null!;

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }

    public Guid UserId { get; set; }

    public Guid IssueId { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
