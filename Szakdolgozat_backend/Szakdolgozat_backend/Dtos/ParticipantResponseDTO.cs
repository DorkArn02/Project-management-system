namespace Szakdolgozat_backend.Dtos
{
    public class ParticipantResponseDTO
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
