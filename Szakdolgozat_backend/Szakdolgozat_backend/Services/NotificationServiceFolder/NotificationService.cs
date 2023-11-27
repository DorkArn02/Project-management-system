using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.NotificationDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.NotificationServiceFolder
{
    public class NotificationService : INotificationService
    {
        private readonly DbCustomContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserHelper _userHelper;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(DbCustomContext db, IHttpContextAccessor httpContextAccessor, IUserHelper userHelper, ILogger<NotificationService> logger)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _userHelper = userHelper;
            _logger = logger;
        }

        public async Task DeleteNotificationById(Guid id)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            Notification? n = await _db.Notifications.FindAsync(id);

            if (n == null)
                throw new NotFoundException($"Notification with id {id} not found.");

            if (n.UserId != userId)
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not notification owner.");

            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} deleted notification with id {id}.");
        }

        public async Task<List<NotificationResponseDTO>> GetUserNotifications()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);
            
            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            List<Notification> notifications = await _db.Notifications.Where(i=>i.UserId==userId).ToListAsync();

            List<NotificationResponseDTO> notificationResponseDTOs = new();

            foreach (var notification in notifications)
            {
                var project = await _db.Projects.FindAsync(notification.ProjectId);

                NotificationResponseDTO notificationResponseDTO = new()
                {
                    Created = notification.Created,
                    Content = notification.Content, 
                    UserId = userId,
                    Id = notification.Id,
                    ProjectName = project.Title,
                    //IsRead = notification.IsRead,
                    ProjectId = project.Id
                };

                notificationResponseDTOs.Add(notificationResponseDTO);
            }
            return notificationResponseDTOs;
        }

        public async Task<Notification> SendNotification(Guid userId, Guid projectId, string content)
        {
            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            Notification n = new()
            {
                Content = content,
                Created = DateTime.Now,
                User = u,
                Project = p
            };

            await _db.Notifications.AddAsync(n);

            await _db.SaveChangesAsync();

            return n;
        }


    }
}
