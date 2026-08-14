using Microsoft.Extensions.DependencyInjection;

namespace NgalaFarms.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Services are now registered in Infrastructure layer
        return services;
    }
}
