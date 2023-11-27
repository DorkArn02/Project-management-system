using Newtonsoft.Json;

namespace Szakdolgozat_backend.Models;

public partial class Project
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime Created { get; set; }

    public DateTime Updated { get; set; }
    [JsonIgnore]
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    public virtual ICollection<Participant> Participants { get; set; } = new List<Participant>();

    public virtual ICollection<ProjectList> ProjectLists { get; set; } = new List<ProjectList>();

    [JsonIgnore]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
