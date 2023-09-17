using System.ComponentModel.DataAnnotations;

namespace Szakdolgozat_backend.Dtos.UserDtos
{
    public class UserLoginRequestDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
