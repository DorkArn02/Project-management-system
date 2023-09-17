namespace Szakdolgozat_backend.Dtos.ProjectListDtos
{
    public class ProjectListRequestDTO
    {
        public string Title { get; set; } = null!;

        public int Position { get; set; }

        public string? Color { get; set; }
    }
}
