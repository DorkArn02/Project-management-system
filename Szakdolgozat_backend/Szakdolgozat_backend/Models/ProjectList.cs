using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Szakdolgozat_backend.Models;

public partial class ProjectList
{
    public Guid Id { get; set; }

    public string Title { get; set; } = null!;

    public int Position { get; set; }

    public string? Color { get; set; }

    public Guid ProjectId { get; set; }

    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;
}
