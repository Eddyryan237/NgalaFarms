using System;
using System.Collections.Generic;
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
        var dashRes = await founderClient.GetAsync("/api/dashboard/founder");
        dashRes.EnsureSuccessStatusCode();
        var dashboard = await dashRes.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dashboard.Should().ContainKey("totalRevenue");
    }

    [Fact]
    public async Task ManagerCanCreateAndUpdateSale_FounderSeesUpdatedRevenue()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "ChangeMe#2026");
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
        using var createdJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
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

        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "ChangeMe#2026");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);

        var listRes = await founderClient.GetAsync("/api/sales");
        listRes.EnsureSuccessStatusCode();
        using var salesJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();

        salesJson.ValueKind.Should().Be(JsonValueKind.Array);
        salesJson.EnumerateArray().Should().ContainSingle(sale =>
            sale.TryGetProperty("id", out var saleIdEl) &&
            saleIdEl.GetInt32() == saleId &&
            sale.TryGetProperty("customerName", out var customerNameEl) &&
            customerNameEl.GetString() == "Integration Customer Updated" &&
            sale.TryGetProperty("notes", out var notesEl) &&
            notesEl.GetString() == "Updated sale");

        var dashboardRes = await founderClient.GetAsync("/api/dashboard/founder");
        dashboardRes.EnsureSuccessStatusCode();
        var dashboard = await dashboardRes.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dashboard.Should().ContainKey("financial");
    }

    [Fact]
    public async Task ManagerCanCreateAndUpdateDailyOperation_FounderCanSeeUpdatedRecord()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "ChangeMe#2026");
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
        using var createdOperationJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
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

        var founderToken = await LoginAndGetToken("founder@ngalafarms.com", "ChangeMe#2026");
        var founderClient = _factory.CreateClient();
        founderClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", founderToken);

        var listRes = await founderClient.GetAsync("/api/daily-operations");
        listRes.EnsureSuccessStatusCode();
        using var operationsJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();

        operationsJson.ValueKind.Should().Be(JsonValueKind.Array);
        operationsJson.EnumerateArray().Should().ContainSingle(op =>
            op.TryGetProperty("id", out var opIdElement) &&
            op.TryGetProperty("operationType", out var opTypeElement) &&
            op.TryGetProperty("description", out var opDescriptionElement) &&
            opIdElement.GetInt32() == operationId &&
            opTypeElement.GetString() == "Weeding" &&
            opDescriptionElement.GetString() == "Cleared and weeded block A1");
    }

    [Fact]
    public async Task ManagerCannotCreateHarvestWithInvalidPalmBlockId()
    {
        var managerToken = await LoginAndGetToken("manager@ngalafarms.com", "ChangeMe#2026");
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
