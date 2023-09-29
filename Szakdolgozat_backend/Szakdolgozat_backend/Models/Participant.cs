using Newtonsoft.Json;

namespace Szakdolgozat_backend.Models;

public partial class Participant
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public Guid ProjectId { get; set; }

    public int RoleId { get; set; }
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;
    [JsonIgnore]
    public virtual Role Role { get; set; } = null!;
    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
