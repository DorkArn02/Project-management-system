using System.Text.Json.Serialization;

namespace Szakdolgozat_backend.Models;

public partial class Issue
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }

    public DateTime? DueDate { get; set; }

    public int Position { get; set; }

    public int? TimeEstimate { get; set; }

    public int? TimeSpent { get; set; }

    public Guid ProjectId { get; set; }

    public Guid ProjectListId { get; set; }

    public Guid UserId { get; set; }

    public int? PriorityId { get; set; }

    public virtual ICollection<AssignedPerson> AssignedPeople { get; set; } = new List<AssignedPerson>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [JsonIgnore]
    public virtual Priority? Priority { get; set; }
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;
    [JsonIgnore]
    public virtual ProjectList ProjectList { get; set; } = null!;
    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
