using System.Security.Claims;

namespace Szakdolgozat_backend.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(List<Claim> claims);
        string GenerateRefreshToken(Guid userId);
    }
}
