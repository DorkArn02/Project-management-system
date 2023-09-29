using Newtonsoft.Json;

namespace Szakdolgozat_backend.Models;

public partial class Priority
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Lvl { get; set; }
    [JsonIgnore]
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
