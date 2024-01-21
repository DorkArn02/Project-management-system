using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.UserDtos;

namespace Szakdolgozat_backend.Services.UserServiceFolder
{
    public interface IUserService
    {
        Task<UserInfoDTO> GetUserById(Guid userId);
        Task<List<UserInfoDTO>> GetAllResults();
        Task ChangeUserPassword([FromBody] ChangePasswordRequestDTO changePasswordRequestDTO);

        Task UploadUserProfilePicture(UserProfilePictureDTO pictureDTO);
    }
}
