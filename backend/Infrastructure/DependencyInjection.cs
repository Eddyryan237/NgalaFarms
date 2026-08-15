using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;
using System.Text;

namespace NgalaFarms.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database: default to SQLite for development. To enable PostgreSQL later,
        // install Npgsql.EntityFrameworkCore.PostgreSQL and replace this registration.
        // Database provider: default to SQLite for local development.
        // To switch to PostgreSQL, install the Npgsql EF Core provider and set DatabaseProvider=Postgres in configuration.
        services.AddDbContext<NgalaFarmsDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection") ?? "Data Source=agriculture.db"));

        // Identity
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 8;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<NgalaFarmsDbContext>()
        .AddDefaultTokenProviders();

        // JWT
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "NgalaFarmsDefaultSecretKey2026!XAF";
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"] ?? "NgalaFarmsAPI",
                ValidAudience = jwtSettings["Audience"] ?? "NgalaFarmsClient",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        context.Token = accessToken;
                    return Task.CompletedTask;
                }
            };
        });

        // Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IIdGeneratorService, IdGeneratorService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IWeeklyReportService, WeeklyReportService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();

        return services;
    }
}
