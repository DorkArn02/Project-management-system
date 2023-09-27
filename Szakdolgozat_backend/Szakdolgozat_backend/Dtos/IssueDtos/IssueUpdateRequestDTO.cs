using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Dtos.IssueDtos
{
    public class IssueUpdateRequestDTO
    {
        public string? Title { get; set; } = null!;

        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }

        public int? TimeEstimate { get; set; }

        public int? TimeSpent { get; set; }

        public int? PriorityId { get; set; }
        public ProjectList? ProjectList { get; set; } = null!;
        public Priority? Priority { get; set; }


    }
}
