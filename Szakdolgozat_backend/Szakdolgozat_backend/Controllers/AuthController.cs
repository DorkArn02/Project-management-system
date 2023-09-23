using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Services.AuthServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterRequestDTO userRegisterDTO)
        {
            var result = await _authService.Register(userRegisterDTO);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginRequestDTO userLoginDTO)
        {
            var result = await _authService.Login(userLoginDTO);

            return Ok(result);
        }

        [HttpGet("refresh")]
        public async Task<IActionResult> RenewAccessToken()
        {
            var token = await _authService.RenewAccessToken();

            return Ok(token);
        }

    }
}
