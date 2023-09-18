using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Dtos.IssueDtos
{
    public class TaskResponseDTO
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

        public Guid ReporterId { get; set; } // Bejelentő azonosítója

        public string ReporterName { get; set; } = string.Empty;

        public Priority Priority { get; set; } = null!;

        public string BoardName { get; set; } = string.Empty;

        public string ProjectName { get; set; } = string.Empty;
    }
}
