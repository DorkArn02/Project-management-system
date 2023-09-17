﻿using Microsoft.AspNetCore.Mvc;

namespace Szakdolgozat_backend.Helpers
{
    public interface IUserHelper
    {
        public bool IsUserMemberOfProject(Guid userId, Guid projectId);
        public Guid GetAuthorizedUserGuid(ControllerBase c);
    }
}
