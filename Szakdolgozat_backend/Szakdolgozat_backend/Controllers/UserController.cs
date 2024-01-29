using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Services.UserServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("get/{userId}")]
        public async Task<IActionResult> GetUserById(Guid userId)
        {
            var result = await _userService.GetUserById(userId);

            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllResults()
        {
            var result = await _userService.GetAllResults();

            return Ok(result);
        }

        [HttpPut("PasswordChange")]
        public async Task<IActionResult> ChangeUserPassword([FromBody] ChangePasswordRequestDTO changePasswordRequestDTO)
        {
            await _userService.ChangeUserPassword(changePasswordRequestDTO);

            return Ok("Password changed");
        }

        [HttpPost("UploadUserProfilePicture")]
        public async Task<IActionResult> UploadUserProfilePicture(IFormFile pictureDTO)
        {
            await _userService.UploadUserProfilePicture(pictureDTO);

            return Ok("Profile uploaded");
        }
    }
}
