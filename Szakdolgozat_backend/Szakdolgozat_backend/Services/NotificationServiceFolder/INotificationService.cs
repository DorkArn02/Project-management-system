using Szakdolgozat_backend.Dtos.NotificationDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.NotificationServiceFolder
{
    public interface INotificationService
    {
        Task<Notification> SendNotification(Guid userId, Guid modifierId, Guid projectId, string content);

        Task<List<NotificationResponseDTO>> GetUserNotifications();
        Task DeleteNotificationById(Guid id);
        Task<List<NotificationResponseDTO>> GetNotificationsByProjectId(Guid projectId);

    }
}
