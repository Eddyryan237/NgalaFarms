using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;
    public DashboardController(IDashboardService svc) => _svc = svc;

    [HttpGet("founder")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> GetFounderDashboard() =>
        Ok(await _svc.GetFounderDashboardAsync());

    [HttpGet("manager")]
    [Authorize(Roles = "Founder,Manager")]
    public async Task<IActionResult> GetManagerDashboard() =>
        Ok(await _svc.GetManagerDashboardAsync());
}
