namespace Szakdolgozat_backend.Dtos.UserDtos
{
    public class UserInfoDTO
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = null!;

        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;

        public DateTime Registered { get; set; }

        //public string? ProfilePic { get; set; }
    }
}
