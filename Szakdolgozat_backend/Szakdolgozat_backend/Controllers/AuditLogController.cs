using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.AuditLogServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet("Get/{projectId}")]
        public async Task<IActionResult> GetAuditLogsByProjectId(Guid projectId)
        {
            var result = await _auditLogService.GetAuditLogs(projectId);

            return Ok(result);
        }
    }
}
