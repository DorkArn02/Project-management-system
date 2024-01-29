using Szakdolgozat_backend.Dtos.UserDtos;

namespace Szakdolgozat_backend.Services.AuthServiceFolder
{
    public interface IAuthService
    {
        Task<UserRegisterResponseDTO> Register(UserRegisterRequestDTO userRegisterDTO);
        Task<UserLoginResponseDTO> Login(UserLoginRequestDTO userLoginDTO);
        Task<string> RenewAccessToken();
    }
}
