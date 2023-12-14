using AutoMapper;
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
        private readonly IMapper _iMapper;

        public NotificationService(DbCustomContext db, IHttpContextAccessor httpContextAccessor, IUserHelper userHelper, ILogger<NotificationService> logger, IMapper iMapper)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _userHelper = userHelper;
            _logger = logger;
            _iMapper = iMapper;
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

        public async Task<List<NotificationResponseDTO>> GetNotificationsByProjectId(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(u.Id, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {u.Id} is not member of project.");

            List<Notification> notifications = await _db.Notifications
                .Where(i => i.ProjectId == projectId)
                .Include(i => i.Project)
                .Include(i => i.User)
                .ToListAsync();

            return _iMapper.Map<List<NotificationResponseDTO>>(notifications)
                .OrderByDescending(i=>i.Created).Take(30).ToList();
        }

        public async Task<List<NotificationResponseDTO>> GetUserNotifications()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);
            
            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            List<Notification> notifications = await _db.Notifications
                .Where(i=>i.UserId==userId)
                .Include(i=>i.Project)
                .ToListAsync();

            return _iMapper.Map<List<NotificationResponseDTO>>(notifications);
        }

        public async Task<Notification> SendNotification(Guid userId, Guid modifierId, Guid projectId, string content)
        {
            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            User? m = await _db.Users.FindAsync(modifierId);

            if (m == null)
                throw new NotFoundException($"User with id {modifierId} not found.");

            Notification n = new()
            {
                Content = content,
                Created = DateTime.Now,
                User = u,
                Project = p,
                Modifier = m
            };

            await _db.Notifications.AddAsync(n);

            await _db.SaveChangesAsync();

            return n;
        }


    }
}
