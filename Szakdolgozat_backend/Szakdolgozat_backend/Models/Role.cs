using System;
using System.Collections.Generic;

namespace Szakdolgozat_backend.Models;

public partial class Role
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool IsAdmin { get; set; }

    public virtual ICollection<Participant> Participants { get; set; } = new List<Participant>();
}
