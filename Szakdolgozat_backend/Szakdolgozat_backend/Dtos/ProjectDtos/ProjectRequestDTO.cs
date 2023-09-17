using System.ComponentModel.DataAnnotations;

namespace Szakdolgozat_backend.Dtos.ProjectDtos
{
    public class ProjectRequestDTO
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? IconName { get; set; } = string.Empty;
    }
}
