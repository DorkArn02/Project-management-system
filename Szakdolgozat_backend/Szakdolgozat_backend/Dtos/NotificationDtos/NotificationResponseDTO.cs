namespace Szakdolgozat_backend.Dtos.NotificationDtos
{
    public class NotificationResponseDTO
    {
        public Guid Id { get; set; }

        public string Content { get; set; } = null!;

        public DateTime Created { get; set; }

        public Guid UserId { get; set; }

        public int IsRead { get; set; }

        public Guid ProjectId { get; set; }

        public string ProjectName { get; set; } = null!;
    }
}
