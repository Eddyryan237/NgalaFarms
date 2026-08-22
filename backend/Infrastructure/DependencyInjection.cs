using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Data;
using NgalaFarms.Infrastructure.Services;
using System.Text;

namespace NgalaFarms.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NgalaFarmsDbContext>(options =>
        {
            var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? configuration.GetConnectionString("DefaultConnection");
            var provider = configuration["DatabaseProvider"] ?? "Postgres";

            if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
                options.UseSqlite(connectionString ?? "Data Source=agriculture.db");
            else
            {
                if (string.IsNullOrWhiteSpace(connectionString) || connectionString.Contains("Host=localhost", StringComparison.OrdinalIgnoreCase))
                {
                    if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production")
                        throw new InvalidOperationException("Production database is not configured. Set DATABASE_URL or ConnectionStrings__DefaultConnection to the Neon PostgreSQL connection string.");

                    connectionString = "Host=localhost;Port=5432;Database=ngala_farms;Username=ngala;Password=ngala_dev_password";
                }

                options.UseNpgsql(NormalizePostgresConnectionString(connectionString));
            }

            options.ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

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

    private static string NormalizePostgresConnectionString(string connectionString)
    {
        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "postgresql" && uri.Scheme != "postgres"))
            return connectionString;

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(uri.UserInfo.Split(':')[0]),
            Password = Uri.UnescapeDataString(uri.UserInfo.Contains(':') ? uri.UserInfo[(uri.UserInfo.IndexOf(':') + 1)..] : string.Empty),
            SslMode = SslMode.Require
        };

        return builder.ConnectionString;
    }
}
