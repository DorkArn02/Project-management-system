namespace Szakdolgozat_backend.Dtos
{
    public class IssueRequestDTO
    {
        public string Title { get; set; } = null!;

        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }

        public int Position { get; set; }

        public int? TimeEstimate { get; set; }

        public int? PriorityId { get; set; }

        public int IssueTypeId { get; set; }
        
        public Guid? ParentIssueId { get; set; }
    }
}
