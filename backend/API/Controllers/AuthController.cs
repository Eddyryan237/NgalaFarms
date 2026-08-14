using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NgalaFarms.Application.DTOs;
using NgalaFarms.Domain.Entities;
using NgalaFarms.Infrastructure.Services;

namespace NgalaFarms.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly ITokenService _tokenService;
    private readonly IAuditService _audit;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signIn, ITokenService tokenService, IAuditService audit)
    {
        _userManager = userManager;
        _signIn = signIn;
        _tokenService = tokenService;
        _audit = audit;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null || !user.IsActive)
            return Unauthorized(new { message = "Invalid credentials" });

        var result = await _signIn.CheckPasswordSignInAsync(user, req.Password, false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateAccessToken(user, roles);
        var refresh = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        await _audit.LogAsync(user.Id, user.FullName, "Login", "Auth", null, null, null, HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new LoginResponse(token, refresh, user.Id, user.FullName, roles.FirstOrDefault() ?? "Manager", DateTime.UtcNow.AddHours(8)));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> Refresh([FromBody] RefreshTokenRequest req)
    {
        var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == req.RefreshToken && u.RefreshTokenExpiry > DateTime.UtcNow);
        if (user == null) return Unauthorized(new { message = "Invalid or expired refresh token" });

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateAccessToken(user, roles);
        var newRefresh = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefresh;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return Ok(new LoginResponse(token, newRefresh, user.Id, user.FullName, roles.FirstOrDefault() ?? "Manager", DateTime.UtcNow.AddHours(8)));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _userManager.UpdateAsync(user);
        }
        return Ok(new { message = "Logged out" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { user.Id, user.FullName, user.Email, Role = roles.FirstOrDefault(), user.IsActive });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var result = await _userManager.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        return Ok(new { message = "Password changed" });
    }
}
