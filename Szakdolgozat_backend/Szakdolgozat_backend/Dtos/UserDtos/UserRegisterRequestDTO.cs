using System.ComponentModel.DataAnnotations;

namespace Szakdolgozat_backend.Dtos.UserDtos
{
    public class UserRegisterRequestDTO
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        [Required, MinLength(6, ErrorMessage = "Minimum password length is 6.")]
        public string Password { get; set; } = string.Empty;
        [Required, Compare("Password"), MinLength(6, ErrorMessage = "Minimum password length is 6.")]
        public string ConfirmPassword { get; set; } = string.Empty;
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
