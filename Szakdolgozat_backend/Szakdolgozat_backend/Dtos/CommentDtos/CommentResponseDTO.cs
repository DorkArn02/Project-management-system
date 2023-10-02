namespace Szakdolgozat_backend.Dtos.CommentDtos
{
    public class CommentResponseDTO
    {
        public Guid Id { get; set; }

        public string Content { get; set; } = null!;

        public DateTime Created { get; set; }

        public DateTime Updated { get; set; }

        public Guid UserId { get; set; }

        public Guid IssueId { get; set; }

        public string AuthorName { get; set; }
    }
}
