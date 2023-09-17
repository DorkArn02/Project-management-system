namespace Szakdolgozat_backend.Dtos.AssignedPersonDtos
{
    public class AssignedPersonDTO
    {
        public int Id { get; set; }

        public Guid IssueId { get; set; }

        public Guid UserId { get; set; }

        public string PersonName { get; set; } = string.Empty;
    }
}
