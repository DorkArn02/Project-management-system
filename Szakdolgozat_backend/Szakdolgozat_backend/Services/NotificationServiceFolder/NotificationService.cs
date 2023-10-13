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

        public NotificationService(DbCustomContext db, IHttpContextAccessor httpContextAccessor, IUserHelper userHelper)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _userHelper = userHelper;
        }

        public async Task DeleteNotificationById(Guid id)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            Notification? n = await _db.Notifications.FindAsync(id);

            if (n == null)
                throw new NotFoundException("Notification not found.");

            if (n.UserId != userId)
                throw new Exceptions.UnauthorizedAccessException("Unauthorized.");

            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();
        }

        public async Task<List<NotificationResponseDTO>> GetUserNotifications()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);
            
            if (u == null)
                throw new NotFoundException("User not found.");

            List<Notification> notifications = await _db.Notifications.ToListAsync();

            List<NotificationResponseDTO> notificationResponseDTOs = new();

            foreach(var notification in notifications)
            {
                var issue = await _db.Issues.FindAsync(notification.IssueId);
                var project = await _db.Projects.FindAsync(issue.ProjectId);
                var projectList = await _db.ProjectLists.FindAsync(issue.ProjectListId);

                NotificationResponseDTO notificationResponseDTO = new()
                {
                    Created = notification.Created,
                    Content = notification.Content, 
                    IssueId = notification.IssueId,
                    UserId = userId,
                    Id = notification.Id,
                    IssueName = issue.Title,
                    ProjectListName = projectList.Title,
                    ProjectName = project.Title,
                    ProjectId = project.Id
                };

                notificationResponseDTOs.Add(notificationResponseDTO);
            }
            return notificationResponseDTOs;
        }

        public async Task<Notification> SendNotification(Guid userId, Guid issueId, string content)
        {
            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException("User not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException("Issue not found.");


            Notification n = new()
            {
                Content = content,
                Created = DateTime.Now,
                Issue = i,
                User = u,
            };

            await _db.Notifications.AddAsync(n);

            await _db.SaveChangesAsync();

            return n;
        }


    }
}
