using System.Security.Claims;
using LoPartidet.API.Data;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class RequestInformation(IHttpContextAccessor httpContextAccessor, LoPartidetContext db) : IRequestInformation
{
    private bool _loaded;
    private int? _userId;
    private IReadOnlyList<Role> _roles = Array.Empty<Role>();

    public bool IsAuthenticated => !string.IsNullOrEmpty(GetIdentityId());

    public int? UserId
    {
        get
        {
            EnsureLoaded();
            return _userId;
        }
    }

    public IReadOnlyList<Role> Roles
    {
        get
        {
            EnsureLoaded();
            return _roles;
        }
    }

    private string? GetIdentityId() =>
        httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    private void EnsureLoaded()
    {
        if (_loaded) return;
        _loaded = true;

        var identityId = GetIdentityId();
        if (string.IsNullOrEmpty(identityId)) return;

        var result = db.Users
            .Where(u => u.IdentityId == identityId)
            .Select(u => new { u.Id, Roles = u.UserRoles.Select(ur => ur.Role).ToList() })
            .FirstOrDefault();

        if (result is null) return;

        _userId = result.Id;
        _roles = result.Roles;
    }
}
