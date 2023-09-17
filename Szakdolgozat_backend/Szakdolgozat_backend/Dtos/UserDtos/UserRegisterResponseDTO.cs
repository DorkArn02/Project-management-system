namespace Szakdolgozat_backend.Dtos.UserDtos
{
    public class UserRegisterResponseDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Registered { get; set; }
    }
}
