using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Helpers
{
    public class UserHelper : IUserHelper
    {
        private readonly DbCustomContext _db;

        public UserHelper(DbCustomContext db)
        {
            _db = db;
        }

        public bool IsUserMemberOfProject(Guid userId, Guid projectId)
        {
            return _db.Participants.Any(p => p.UserId == userId && p.ProjectId == projectId);
        }

        public Guid GetAuthorizedUserGuid(ControllerBase c)
        {
            return Guid.Parse(c.User.FindFirstValue(ClaimTypes.NameIdentifier));
        }
    }
}
