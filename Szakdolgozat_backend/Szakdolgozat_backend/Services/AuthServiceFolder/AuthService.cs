using AutoMapper;
using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Claims;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.TokenServiceFolder;

namespace Szakdolgozat_backend.Services.AuthServiceFolder
{
    public class AuthService : IAuthService
    {
        private readonly DbCustomContext _dbContext;
        private readonly IMapper _iMapper;
        private readonly IDistributedCache _distributedCache;
        private readonly ITokenService _tokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuthService> _logger;
        public AuthService(DbCustomContext dbContext, IMapper iMapper, IDistributedCache distributedCache, ITokenService tokenService, IHttpContextAccessor httpContextAccessor, ILogger<AuthService> logger)
        {
            _dbContext = dbContext;
            _iMapper = iMapper;
            _distributedCache = distributedCache;
            _tokenService = tokenService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<UserLoginResponseDTO> Login(UserLoginRequestDTO userLoginDTO)
        {
            User? u = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == userLoginDTO.Email);

            if (u == null)
                throw new NotFoundException($"User with e-mail {userLoginDTO.Email} not found.");

            if (!BCrypt.Net.BCrypt.Verify(userLoginDTO.Password, u.PasswordHash))
                throw new Exceptions.UnauthorizedAccessException($"User with id {u.Id} and email {u.Email} has attempted to log in but provided wrong credentials.");
          
            (var token, var refreshToken) = GenerateTokens(u);

            SetCookie(refreshToken);

            _logger.LogInformation($"User with id {u.Id} has logged in.");

            return _iMapper.Map<User, UserLoginResponseDTO>(u,
                opt => opt.AfterMap((src, dest) => dest.AccessToken = token));
        }

        public async Task<UserRegisterResponseDTO> Register(UserRegisterRequestDTO userRegisterDTO)
        {
            User u = await CreateUser(userRegisterDTO);
            await _dbContext.Users.AddAsync(u);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation($"New account has created with id: {u.Id}.");

            return _iMapper.Map<UserRegisterResponseDTO>(u);
        }

        private async Task<Guid> ValidateToken(string token)
        {
            string? dbtext = await _distributedCache.GetStringAsync(token);
            if (dbtext == null)
                throw new BadRequestException("Invalid token.");

            return Guid.Parse(dbtext);
        }

        public async Task<string> RenewAccessToken()
        {
            var oldRefreshToken = _httpContextAccessor
                .HttpContext.Request.Cookies["refreshToken"];

            if (oldRefreshToken == null)
                throw new BadRequestException("Invalid token.");

            Guid userId = await ValidateToken(oldRefreshToken);

            User? u = await _dbContext.Users.FindAsync(userId);

            if (u == null)
                throw new BadRequestException("Invalid token.");

            return GenerateTokens(u).AccessToken;
        }

        private async Task<User> CreateUser(UserRegisterRequestDTO userRegisterDTO)
        {
            if (await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == userRegisterDTO.Email) != null)
                throw new UserConflictException($"Email {userRegisterDTO.Email} already in use.");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(userRegisterDTO.Password);

            return new User
            {
                FirstName = userRegisterDTO.FirstName,
                LastName = userRegisterDTO.LastName,
                Email = userRegisterDTO.Email,
                Registered = DateTime.Now,
                PasswordHash = passwordHash
            };
        }

        private static List<Claim> GenerateClaims(User u)
        {
            return new List<Claim>
            {
                new (ClaimTypes.Email, u.Email),
                new (ClaimTypes.NameIdentifier, u.Id.ToString()),
                new (ClaimTypes.Surname, u.FirstName),
                new (ClaimTypes.GivenName, u.LastName)
            };
        }

        private void SetCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                IsEssential = true,
                SameSite = SameSiteMode.None,
                Secure = true
            };

            _httpContextAccessor.HttpContext.Response.Cookies
                .Append("refreshToken", refreshToken, cookieOptions);
        }

        private (string AccessToken, string RefreshToken) GenerateTokens(User u)
        {
            var claims = GenerateClaims(u);
            var accessToken = _tokenService.GenerateAccessToken(claims);
            var refreshToken = _tokenService.GenerateRefreshToken(u.Id);

            SetCookie(refreshToken);

            _logger.LogInformation($"User with id {u.Id} has requested a new refresh token.");

            return (accessToken, refreshToken);
        }
    }
}
