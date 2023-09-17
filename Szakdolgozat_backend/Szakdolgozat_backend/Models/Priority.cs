using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Szakdolgozat_backend.Models;

public partial class Priority
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Lvl { get; set; }

    public string? Color { get; set; }

    public string? IconName { get; set; }
    [JsonIgnore]
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
