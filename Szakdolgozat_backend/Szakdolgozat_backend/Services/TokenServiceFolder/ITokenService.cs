using System.Security.Claims;

namespace Szakdolgozat_backend.Services.TokenServiceFolder
{
    public interface ITokenService
    {
        string GenerateAccessToken(List<Claim> claims);
        string GenerateRefreshToken(Guid userId);
    }
}
