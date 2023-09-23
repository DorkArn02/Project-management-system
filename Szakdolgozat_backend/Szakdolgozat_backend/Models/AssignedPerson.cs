using System.Text.Json.Serialization;

namespace Szakdolgozat_backend.Models;

public partial class AssignedPerson
{
    public int Id { get; set; }

    public Guid IssueId { get; set; }

    public Guid UserId { get; set; }

    [JsonIgnore]
    public virtual Issue Issue { get; set; } = null!;
    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
