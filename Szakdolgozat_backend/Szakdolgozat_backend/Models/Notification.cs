using Newtonsoft.Json;

namespace Szakdolgozat_backend.Models;

public partial class Notification
{
    public Guid Id { get; set; }

    public string Content { get; set; } = null!;

    public DateTime Created { get; set; }

    //public bool IsRead { get; set; }

    public Guid UserId { get; set; }
    public Guid ModifierId { get; set; }

    public Guid ProjectId { get; set; }

    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;

    [JsonIgnore]
    public virtual User User { get; set; } = null!;

    [JsonIgnore]
    public virtual User Modifier { get; set; } = null!;
}
