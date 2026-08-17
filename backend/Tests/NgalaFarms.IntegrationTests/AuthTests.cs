using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace NgalaFarms.IntegrationTests;

public class AuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithSeedFounder_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var login = new { email = "founder@ngalafarms.com", password = "ChangeMe#2026" };
        var res = await client.PostAsJsonAsync("/api/auth/login", login);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        json.Should().Contain("accessToken", "response should include an access token");
    }
}
