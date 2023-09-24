namespace Szakdolgozat_backend.Dtos.UserDtos
{
    public class ChangePasswordRequestDTO
    {
        public string oldPassword { get; set;}
        public string password1 { get; set; }
        public string password2 { get; set; }
    }
}
