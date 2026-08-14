using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Founder")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _svc;
    public AnalyticsController(IAnalyticsService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? from, [FromQuery] DateTime? to) =>
        Ok(await _svc.GetCompanyAnalyticsAsync(from, to));
}
