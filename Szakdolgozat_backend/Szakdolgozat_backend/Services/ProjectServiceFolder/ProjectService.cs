using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Hubs;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.AuditLogServiceFolder;
using Szakdolgozat_backend.Services.NotificationServiceFolder;

namespace Szakdolgozat_backend.Services.ProjectServiceFolder
{
    public class ProjectService : IProjectService
    {

        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IMapper _iMapper;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ProjectService> _logger;
        private readonly IHubContext<MessageHub, IMessageHub> _messageHub;
        private readonly IAuditLogService _auditLogService;

        public ProjectService(DbCustomContext db, IUserHelper userHelper, IMapper iMapper, IHttpContextAccessor contextAccessor, INotificationService notificationService, ILogger<ProjectService> logger, IHubContext<MessageHub, IMessageHub> messageHub, IAuditLogService auditLogService)
        {
            _db = db;
            _userHelper = userHelper;
            _iMapper = iMapper;
            _contextAccessor = contextAccessor;
            _notificationService = notificationService;
            _logger = logger;
            _messageHub = messageHub;
            _auditLogService = auditLogService;
        }
        public async Task<List<ProjectResponseDTO>> GetAllProjects()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);
            
            var userProjects = await _db.Projects
            .Where(project => _db.Participants
                .Where(participant => 
                participant.UserId == userId && participant.ProjectId == project.Id)
                .Any())
            .Include(project => project.Participants)
                .ThenInclude(participant => participant.Role)
            .Include(project => project.Participants)
                .ThenInclude(participant => participant.User)
            .AsSplitQuery()
            .ToListAsync();

            _logger.LogInformation($"GetAllProjects called by user {userId}.");

            return _iMapper.Map<List<ProjectResponseDTO>>(userProjects);
        }
        public async Task<ProjectResponseDTO> GetProjectById(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? existingProject = await _db.Projects
                .Where(project => project.Id == projectId)
                .Include(project => project.Participants)
                    .ThenInclude(participant => participant.Role)
                .Include(project => project.Participants)
                    .ThenInclude(participant => participant.User)
                .FirstOrDefaultAsync();

            if (existingProject == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, existingProject.Id))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project {existingProject.Id}.");

            _logger.LogInformation($"GetProjectById called by user {userId}.");

            return _iMapper.Map<ProjectResponseDTO>(existingProject);
        }
        public async Task<ProjectCreatedDTO> AddProject(ProjectRequestDTO p)
        {
            Project newProject = new()
            {
                Created = DateTime.Now,
                Updated = DateTime.Now,
                Description = p.Description,
                Title = p.Title
            };

            await _db.Projects.AddAsync(newProject);
            await _db.SaveChangesAsync();

            var role = await _db.Roles.FirstAsync(i => i.Id == 1);
            var user = await _db.Users
                .FirstAsync(i => i.Id == _userHelper.GetAuthorizedUserGuid2(_contextAccessor));

            Participant participant = new()
            {
                Project = newProject,
                Role = role,
                User = user,
            };

            await _db.Participants.AddAsync(participant);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {user.Id} has created a new project with name {newProject.Title} and id {newProject.Id}.");

            return _iMapper.Map<ProjectCreatedDTO>(newProject);
        }
        public async Task AddUserToProject(string email, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? p = await _db.Projects.FindAsync(projectId);
            User? u = await _db.Users.FirstOrDefaultAsync(i => i.Email == email);
            Role? r = await _db.Roles.FindAsync(2);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (r == null)
                throw new NotFoundException($"Role not found.");

            if (u == null)
                throw new NotFoundException($"User with email {email} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            if (_userHelper.IsUserMemberOfProject(u.Id, projectId))
                throw new UserConflictException($"User with id {u.Id} already added to project.");

            Participant participant = new()
            {
                Project = p,
                User = u,
                Role = r
            };

            await _notificationService.SendNotification(u.Id, userId, projectId, $"Hozzá letté rendelve a(z) {p.Title} nevű projekthez.");
            await _messageHub.Clients.Client(u.Id.ToString()).SendMessage($"Hozzá letté rendelve a(z) {p.Title} nevű projekthez.");
            await _auditLogService.AddAuditLog(projectId, $"A(z) {u.LastName} {u.FirstName} nevű személy hozzárendelése a projekthez.");

            _logger.LogInformation($"User with id {userId} has added a user ({u.Id}) to project {p.Title}.");

            await _db.Participants.AddAsync(participant);
            await _db.SaveChangesAsync();
        }
        public async Task DeleteProjectById(Guid projectId)
        {
            Project? existingProject = await _db.Projects.FirstOrDefaultAsync(project => project.Id == projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            if (existingProject == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            await _db.Database.ExecuteSqlInterpolatedAsync($"DeleteProjectAndLists {projectId}");

            _db.Projects.Remove(existingProject);

            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} has deleted project {existingProject.Id}.");
        }
        public async Task RemoveUserFromProject(Guid existingUserId, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? p = await _db.Projects.FindAsync(projectId);
            User? u = await _db.Users.FindAsync(existingUserId);
            Role? r = await _db.Roles.FindAsync(2);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (r == null)
                throw new NotFoundException("Role not found.");

            if (u == null)
                throw new NotFoundException($"User with id {existingUserId} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            if (!_userHelper.IsUserMemberOfProject(existingUserId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {existingUserId} not member of this project.");

            Participant participant = await _db.Participants
                .Where(p => p.ProjectId == projectId && p.UserId == existingUserId)
                .FirstAsync();

            _db.Participants.Remove(participant);
            await _db.SaveChangesAsync();

            await _notificationService.SendNotification(u.Id, userId, projectId, $"El lettél távolítva a(z) {p.Title} nevű projektből.");
            await _messageHub.Clients.Client(u.Id.ToString()).SendMessage($"El lettél távolítva a(z) {p.Title} nevű projektből.");
            await _auditLogService.AddAuditLog(projectId, $"A(z) {u.LastName} {u.FirstName} nevű személy eltávolítása a projektből.");


            _logger.LogInformation($"User with id {userId} has removed a user ({u.Id}) from project {p.Title}.");

        }
        public async Task<ProjectCreatedDTO> UpdateProjectById(Guid projectId, ProjectRequestDTO projectRequestDTO)
        {
            Project? existingProject = await _db.Projects
                .Where(p=>p.Id==projectId).Include(p=>p.Participants).FirstOrDefaultAsync();
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            if (existingProject == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");
            
            existingProject.Title = projectRequestDTO.Title;
            existingProject.Updated = DateTime.Now;
            existingProject.Description = projectRequestDTO.Description;

            _db.Projects.Update(existingProject);
            await _db.SaveChangesAsync();

            foreach(var item in existingProject.Participants)
            {
                if(item.UserId != userId)
                {
                    await _notificationService.SendNotification(item.UserId, userId, projectId, $"A(z) {existingProject.Title} nevű projekt beállításai módosultak.");
                    await _messageHub.Clients.Client(item.UserId.ToString()).SendMessage($"A(z) {existingProject.Title} nevű projekt beállításai módosultak.");
                }
            }

            await _auditLogService.AddAuditLog(projectId, $"A projekt beállításainak a módosítása.");

            _logger.LogInformation($"User with id {userId} has updated a project with id {existingProject.Id}.");

            return _iMapper.Map<ProjectCreatedDTO>(existingProject);
        }
    }
}
