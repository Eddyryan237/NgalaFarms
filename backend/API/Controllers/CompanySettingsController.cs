using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Infrastructure.Data;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/company-settings")]
[Authorize]
public class CompanySettingsController : ControllerBase
{
    private readonly NgalaFarmsDbContext _db;
    private readonly IWebHostEnvironment _env;
    public CompanySettingsController(NgalaFarmsDbContext db, IWebHostEnvironment env)
    { _db = db; _env = env; }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var s = await _db.CompanySettings.FirstOrDefaultAsync();
        if (s == null) return NotFound();
        return Ok(new CompanySettingsDto { Id = s.Id, CompanyName = s.CompanyName, LogoUrl = s.LogoUrl, Phone = s.Phone, Email = s.Email, Address = s.Address, Description = s.Description, Currency = s.Currency, Website = s.Website });
    }

    [HttpPut]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> Update([FromBody] UpdateCompanySettingsRequest req)
    {
        var s = await _db.CompanySettings.FirstOrDefaultAsync();
        if (s == null) return NotFound();
        s.CompanyName = req.CompanyName; s.Phone = req.Phone; s.Email = req.Email;
        s.Address = req.Address; s.Description = req.Description; s.Currency = req.Currency;
        s.Website = req.Website;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("upload-logo")]
    [Authorize(Roles = "Founder")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "No file provided" });

        var allowedTypes = new[] { "image/png", "image/jpeg", "image/svg+xml", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Invalid file type. Use PNG, JPG, SVG, or WebP." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File too large. Maximum 5MB." });

        var logoDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "assets", "logo");
        Directory.CreateDirectory(logoDir);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"ngala-farms-logo{ext}";
        var filePath = Path.Combine(logoDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var s = await _db.CompanySettings.FirstOrDefaultAsync();
        if (s != null)
        {
            s.LogoPath = filePath;
            s.LogoUrl = $"/assets/logo/{fileName}";
            await _db.SaveChangesAsync();
        }

        return Ok(new { logoUrl = $"/assets/logo/{fileName}" });
    }
}
