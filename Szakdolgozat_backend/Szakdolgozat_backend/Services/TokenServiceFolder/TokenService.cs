using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Szakdolgozat_backend.Services.TokenServiceFolder
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly IDistributedCache _distributedCache;
        private readonly ILogger<TokenService> _logger;

        public TokenService(IConfiguration config, IDistributedCache distributedCache, ILogger<TokenService> logger)
        {
            _config = config;
            _distributedCache = distributedCache;
            _logger = logger;
        }

        public string GenerateAccessToken(List<Claim> claims)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
                _config["Jwt:Audience"], claims,
                expires: DateTime.Now.AddMinutes(5),
                signingCredentials: credentials);

            _logger.LogInformation($"Access token generated");

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken(Guid userId)
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            string refreshToken = Convert.ToBase64String(randomNumber);

            _distributedCache.SetString(refreshToken, userId.ToString(), new DistributedCacheEntryOptions
            {
                AbsoluteExpiration = DateTimeOffset.Now.AddDays(7)
            });

            _logger.LogInformation($"Refresh token generated for user with id {userId}.");

            return refreshToken;
        }
    }
}
