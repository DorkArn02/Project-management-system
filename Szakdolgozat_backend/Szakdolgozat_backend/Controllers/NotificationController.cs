using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Services.NotificationServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetNotifications()
        {
            var result = await _notificationService.GetUserNotifications();
            return Ok(result);
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetNotificationsByProjectId(Guid projectId)
        {
            var result = await _notificationService.GetNotificationsByProjectId(projectId);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            await _notificationService.DeleteNotificationById(id);

            return NoContent();
        }
    }
}
