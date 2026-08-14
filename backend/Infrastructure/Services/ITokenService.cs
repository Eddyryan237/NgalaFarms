using NgalaFarms.Domain.Entities;

namespace NgalaFarms.Infrastructure.Services;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
}
