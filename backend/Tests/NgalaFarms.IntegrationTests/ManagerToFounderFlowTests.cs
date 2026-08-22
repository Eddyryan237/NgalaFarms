using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
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
        return body!["accessToken"]!.ToString()!;
    }

    [Fact]
    public async Task ManagerCreatesSale_FounderDashboardReflectsRevenue()
    {
        var token = await LoginAndGetToken("manager@ngalafarms.com", "nmanager123");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create a sale
        var sale = new { customerName = "Integration Customer", product = "Palm Oil", quantityLitres = 10, unitPrice = 2000, paymentMethod = "Cash", paymentStatus = "Paid" };
        var res = await client.PostAsJsonAsync("/api/sales", sale);
        res.EnsureSuccessStatusCode();

        // Login as founder and check dashboard
        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "founderngala123");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);
        var dashRes = await founderClient.GetAsync("/api/dashboard/founder");
        dashRes.EnsureSuccessStatusCode();
        var dashboard = await dashRes.Content.ReadFromJsonAsync<JsonElement>();
        dashboard.GetProperty("financial").GetProperty("totalRevenue").GetDecimal().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ManagerCanCreateAndUpdateSale_FounderSeesUpdatedRevenue()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "nmanager123");
        var managerClient = _factory.CreateClient();
        managerClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managerToken);

        var createPayload = new
        {
            customerName = "Integration Customer",
            product = "Palm Oil",
            quantityLitres = 10,
            unitPrice = 2000,
            paymentMethod = "Cash",
            paymentStatus = "Paid",
            saleDate = DateTime.UtcNow.Date,
            notes = "Initial sale"
        };

        var createRes = await managerClient.PostAsJsonAsync("/api/sales", createPayload);
        createRes.EnsureSuccessStatusCode();
        var createdJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        createdJson.TryGetProperty("id", out var idElement).Should().BeTrue();

        var saleId = idElement.GetInt32();

        var updatePayload = new
        {
            customerName = "Integration Customer Updated",
            product = "Palm Oil",
            quantityLitres = 12,
            unitPrice = 2200,
            paymentMethod = "BankTransfer",
            paymentStatus = "Paid",
            saleDate = DateTime.UtcNow.Date,
            notes = "Updated sale"
        };

        var updateRes = await managerClient.PutAsJsonAsync($"/api/sales/{saleId}", updatePayload);
        updateRes.EnsureSuccessStatusCode();

        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "founderngala123");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);

        var listRes = await founderClient.GetAsync("/api/sales");
        listRes.EnsureSuccessStatusCode();
        var salesJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();

        salesJson.ValueKind.Should().Be(JsonValueKind.Array);
        var updatedSale = salesJson.EnumerateArray().Single(sale => sale.GetProperty("id").GetInt32() == saleId);
        updatedSale.GetProperty("customerName").GetString().Should().Be("Integration Customer Updated");
        updatedSale.GetProperty("notes").GetString().Should().Be("Updated sale");

        var dashboardRes = await founderClient.GetAsync("/api/dashboard/founder");
        dashboardRes.EnsureSuccessStatusCode();
        var dashboard = await dashboardRes.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dashboard.Should().ContainKey("financial");
    }

    [Fact]
    public async Task ManagerCanCreateAndUpdateDailyOperation_FounderCanSeeUpdatedRecord()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "nmanager123");
        var managerClient = _factory.CreateClient();
        managerClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managerToken);

        var createPayload = new
        {
            operationType = "Clearing",
            description = "Cleared block A1",
            date = DateTime.UtcNow.Date,
            plantationId = "PLT-0001",
            palmBlockId = "A1"
        };

        var createRes = await managerClient.PostAsJsonAsync("/api/daily-operations", createPayload);
        createRes.EnsureSuccessStatusCode();
        var createdOperationJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        createdOperationJson.TryGetProperty("id", out var idElement).Should().BeTrue();

        var operationId = idElement.GetInt32();

        var updatePayload = new
        {
            operationType = "Weeding",
            description = "Cleared and weeded block A1",
            date = DateTime.UtcNow.Date,
            plantationId = "PLT-0001",
            palmBlockId = "A1",
            performedBy = "manager@ngalafarms.com"
        };

        var updateRes = await managerClient.PutAsJsonAsync($"/api/daily-operations/{operationId}", updatePayload);
        updateRes.EnsureSuccessStatusCode();

        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "founderngala123");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);

        var listRes = await founderClient.GetAsync("/api/daily-operations");
        listRes.EnsureSuccessStatusCode();
        var operationsJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();

        operationsJson.ValueKind.Should().Be(JsonValueKind.Array);
        var updatedOperation = operationsJson.EnumerateArray().Single(op => op.GetProperty("id").GetInt32() == operationId);
        updatedOperation.GetProperty("operationType").GetString().Should().Be("Weeding");
        updatedOperation.GetProperty("description").GetString().Should().Be("Cleared and weeded block A1");
    }

    [Fact]
    public async Task ManagerCannotCreateHarvestWithInvalidPalmBlockId()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "nmanager123");
        var managerClient = _factory.CreateClient();
        managerClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managerToken);

        var payload = new
        {
            plantationId = 1,
            palmBlockId = 999999,
            harvestDate = DateTime.UtcNow.Date,
            numberOfBunches = 10,
            totalWeightKg = 120,
            harvestTeam = "Team Alpha",
            laborCost = 5000,
            notes = "invalid block test"
        };

        var response = await managerClient.PostAsJsonAsync("/api/palm-harvests", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        body.Should().ContainKey("message");
    }
}
