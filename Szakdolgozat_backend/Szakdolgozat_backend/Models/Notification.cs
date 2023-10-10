using Newtonsoft.Json;

namespace Szakdolgozat_backend.Models;

public partial class Notification
{
    public Guid Id { get; set; }

    public string Content { get; set; } = null!;

    public DateTime Created { get; set; }

    public Guid UserId { get; set; }

    public Guid IssueId { get; set; }

    [JsonIgnore]
    public virtual Issue Issue { get; set; } = null!;
    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
