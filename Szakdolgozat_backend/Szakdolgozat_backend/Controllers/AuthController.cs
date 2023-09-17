using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DbCustomContext _dbContext;
        private readonly IMapper _iMapper;
        private readonly IDistributedCache _distributedCache;
        private readonly ITokenService _tokenService;

        public AuthController(IConfiguration config, DbCustomContext dbContext, IMapper iMapper, IDistributedCache distributedCache, ITokenService tokenService)
        {
            _config = config;
            _dbContext = dbContext;
            _iMapper = iMapper;
            _distributedCache = distributedCache;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public IActionResult Register(UserRegisterRequestDTO userRegisterDTO)
        {         
            if(_dbContext.Users.FirstOrDefault(u => u.Email == userRegisterDTO.Email) != null)
            {
                return Conflict("Email already in use.");
            }

            string passwordHash =
                BCrypt.Net.BCrypt.HashPassword(userRegisterDTO.Password);

            User u = new()
            {
                FirstName = userRegisterDTO.FirstName,
                LastName = userRegisterDTO.LastName,
                Email = userRegisterDTO.Email,
                Registered = DateTime.Now,
                PasswordHash = passwordHash
            };

            _dbContext.Users.Add(u);
            _dbContext.SaveChanges();

            return Ok(_iMapper.Map<UserRegisterResponseDTO>(u));
        }

        [HttpPost("login")]
        public IActionResult Login(UserLoginRequestDTO userLoginDTO)
        {
            User? u = _dbContext.Users.FirstOrDefault(u => u.Email == userLoginDTO.Email);

            if (u == null)
            {
                return NotFound();
            }

            if (!BCrypt.Net.BCrypt.Verify(userLoginDTO.Password, u.PasswordHash))
            {
                return Unauthorized();
            }

            var claims = new List<Claim>
            {
               new Claim(ClaimTypes.Email, u.Email),
               new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()),
               new Claim(ClaimTypes.Surname, u.FirstName),
               new Claim(ClaimTypes.GivenName, u.LastName)
            };

            var token = _tokenService.GenerateAccessToken(claims);
            var refreshToken = _tokenService.GenerateRefreshToken(u.Id);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                IsEssential = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.None,
                Secure = true,
            };

            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            UserLoginResponseDTO userLoginResponseDTO = new()
            {
                AccessToken = token,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Registered = u.Registered,
                Id = u.Id,
            };

            return Ok(userLoginResponseDTO);
        }

        //private JwtSecurityToken? GetJwtSecurityTokenFromHeader()
        //{
        //    try
        //    {
        //        var accessToken = HttpContext.Request.Headers[HeaderNames.Authorization];
        //        string tokenString = accessToken.ToString();
        //        if (tokenString.StartsWith("bearer", StringComparison.InvariantCultureIgnoreCase))
        //        {
        //            tokenString = tokenString.Substring(7);
        //        }
        //        var handler = new JwtSecurityTokenHandler();
        //        return (JwtSecurityToken?)handler.ReadJwtToken(tokenString);
        //    }
        //    catch
        //    {
        //        return null;
        //    }
        //}

        [HttpGet("refresh")]
        public IActionResult RenewAccessToken()
        {
            var oldRefreshToken = Request.Cookies["refreshToken"];

            if (oldRefreshToken == null)
                return BadRequest();

            string? dbtext = _distributedCache.GetString(oldRefreshToken);

            if(dbtext == null)
            {
                return BadRequest();
            }

            Guid userId = Guid.Parse(dbtext);

            User? u = _dbContext.Users.Find(userId);

            if (u == null)
                return BadRequest();

            var claims = new List<Claim>
            {
               new Claim(ClaimTypes.Email, u.Email),
               new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()),
               new Claim(ClaimTypes.Surname, u.FirstName),
               new Claim(ClaimTypes.GivenName, u.LastName)
            };

            var token = _tokenService.GenerateAccessToken(claims);
            var refreshToken = _tokenService.GenerateRefreshToken(u.Id);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                IsEssential = true,
                SameSite = Microsoft.AspNetCore.Http.SameSiteMode.None,
                Secure = true,
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
            return Ok(token);
        }

    }
}
