using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace NgalaFarms.IntegrationTests;

public class ManagerToFounderFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ManagerToFounderFlowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private async Task<string> LoginAndGetToken(string email, string password)
    {
        var client = _factory.CreateClient();
        var login = new { email, password };
        var res = await client.PostAsJsonAsync("/api/auth/login", login);
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        return body![("token")]!.ToString()!;
    }

    [Fact]
    public async Task ManagerCreatesSale_FounderDashboardReflectsRevenue()
    {
        var token = await LoginAndGetToken("manager@ngalafarms.com", "ChangeMe#2026");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create a sale
        var sale = new { customerName = "Integration Customer", product = "Palm Oil", quantityLitres = 10, unitPrice = 2000, paymentMethod = "Cash", paymentStatus = "Paid" };
        var res = await client.PostAsJsonAsync("/api/sales", sale);
        res.EnsureSuccessStatusCode();

        // Login as founder and check dashboard
        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "ChangeMe#2026");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);
        var dashRes = await founderClient.GetAsync("/api/dashboard/admin");
        dashRes.EnsureSuccessStatusCode();
        var dashboard = await dashRes.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dashboard.Should().ContainKey("totalRevenue");
    }
}
