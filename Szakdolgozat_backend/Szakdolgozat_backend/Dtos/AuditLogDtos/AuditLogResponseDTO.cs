namespace Szakdolgozat_backend.Dtos.AuditLogDtos
{
    public class AuditLogResponseDTO
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public DateTime Created { get; set; }

        public string Content { get; set; } = null!;

        public Guid ProjectId { get; set; }

        public string ProjectName { get; set; } = null!;

        public string PersonName { get; set; } = null!;
    }
}
