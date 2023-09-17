using Szakdolgozat_backend.Dtos.IssueDtos;

namespace Szakdolgozat_backend.Dtos.ProjectListDtos
{
    public class ProjectListResponseDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = null!;

        public int Position { get; set; }

        public string? Color { get; set; }

        public Guid ProjectId { get; set; }

        public List<IssueResponseDTO> Issues { get; set; } = new List<IssueResponseDTO>();
    }
}
