using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.NotificationServiceFolder;

namespace Szakdolgozat_backend.Services.IssueServiceFolder
{
    public class IssueService : IIssueService
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;
        private readonly ILogger<IssueService> _logger;

        public IssueService(DbCustomContext db, IUserHelper userHelper, IHttpContextAccessor httpContextAccessor, INotificationService notificationService, ILogger<IssueService> logger)
        {
            _db = db;
            _userHelper = userHelper;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<Issue> AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int participantId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");
            
            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");
            
            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            Participant? participant = await _db.Participants.FindAsync(participantId);

            if (participant == null)
                throw new NotFoundException($"Participant with id {participantId} not found.");

            User? u = await _db.Users.FindAsync(participant.UserId);
            User? u2 = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {participant.UserId} not found.");

            if (u2 == null)
                throw new NotFoundException($"User with id {userId} not found.");


            AssignedPerson? assignedPerson = await _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == participant.UserId)
                .FirstOrDefaultAsync();

            if (assignedPerson != null)
                throw new UserConflictException($"User with id {participant.UserId} already added as assignee.");

            AssignedPerson assigned = new()
            {
                Issue = i,
                User = u
            };

            // Send notification
            if (participant.UserId != userId)
            {
                await _notificationService
                .SendNotification(participant.UserId, issueId, 
                $"Hozzá lettél rendelve a(z) {i.Title} nevű feladathoz." +
                $" Módosító: {u2.LastName + " " + u2.FirstName}.");
            }

            await _db.AssignedPeople.AddAsync(assigned);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} has assigned a user {u.Id} to issue {issueId} in project {projectId}.");

            return i;
        }

        public async Task AddChildIssue(Guid projectId, Guid parentId, Guid childId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            Issue? parentIssue = await _db.Issues.FindAsync(parentId);

            if (parentIssue == null)
                throw new NotFoundException($"Issue with id {parentId} not found.");

            Issue? childIssue = await _db.Issues.FindAsync(childId);

            if (childIssue == null)
                throw new NotFoundException($"Issue with id {childId} not found.");
            
            if(childIssue.ParentIssueId == null)
            {
                childIssue.ParentIssueId = parentIssue.Id;
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue with id {childId} in project {projectId} has connected to parent issue {parentId} by user {userId}.");
        }

        public async Task<Issue> AddIssueToProjectList(Guid projectId, Guid projectListId, IssueRequestDTO issueRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            if (issueRequestDTO.Position < 0)
                throw new BadRequestException("Position can not be negative.");

            bool positionDup = await _db.Issues
                .Where(p => p.ProjectId == projectId && p.ProjectListId == projectListId)
                .AnyAsync(p => p.Position == issueRequestDTO.Position);

            if (positionDup)
                throw new BadRequestException("Position duplication is not allowed.");

            ProjectList? projectList = await _db.ProjectLists
                .Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            Priority? priority = await _db.Priorities.FindAsync(issueRequestDTO.PriorityId); ;

            IssueType? issueType = await _db.IssueTypes.FindAsync(issueRequestDTO.IssueTypeId);

            if(issueType == null)
                throw new NotFoundException($"Issue type with id {issueRequestDTO.IssueTypeId} not found.");

            if (priority == null)
                    throw new NotFoundException($"Priority with id {issueRequestDTO.PriorityId} not found.");

            if (issueRequestDTO.TimeEstimate != null && issueRequestDTO.TimeEstimate < 0)
                throw new BadRequestException("Time estimate can not be negative.");

            if (issueRequestDTO.DueDate != null && issueRequestDTO.DueDate < DateTime.Now)
                throw new BadRequestException("Due date can not be smaller than now");


            Issue i = new()
            {
                Title = issueRequestDTO.Title,
                Description = issueRequestDTO.Description,
                Created = DateTime.Now,
                Updated = DateTime.Now,
                DueDate = issueRequestDTO.DueDate,
                Position = issueRequestDTO.Position,
                Project = p,
                ProjectList = projectList,
                TimeEstimate = issueRequestDTO.TimeEstimate,
                User = user,
                Priority = priority ?? null,
                IssueType = issueType
            };


            if (issueRequestDTO.ParentIssueId != null)
            {
                Issue i2 = await _db.Issues.FindAsync(issueRequestDTO.ParentIssueId);

                if(i2 == null)
                    throw new NotFoundException($"Issue with id {issueRequestDTO.ParentIssueId} not found.");

                if (i2.IssueType.Name == "Subtask")
                    throw new BadRequestException("Subtask can not be parent of a task.");

                i.ParentIssue = i2;
            }

            await _db.Issues.AddAsync(i);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue with id {i.Id} has added to project list {projectListId} in project {projectId} by user {userId}.");

            return i;
        }

        public async Task<Issue> ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            User? r = await _db.Users.FindAsync(reporterId);

            if (r == null)
                throw new NotFoundException($"Reporter with id {reporterId} not found.");

            if (i.UserId == reporterId)
                throw new UserConflictException("User id can not be same.");

            i.User = r;

            _db.Issues.Update(i);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue {issueId} reporter has changed by {userId} in project {projectId}.");

            return i;
        }

        public async Task ChangePositionBetweenColumns(Guid projectId, Guid sourceColumnId, Guid destColumnId, Guid issueId, Dictionary<Guid, int> sourcePositions, Dictionary<Guid, int> destPositions)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? sourceColumn = await _db.ProjectLists.FindAsync(sourceColumnId);

            if (sourceColumn == null)
                throw new NotFoundException("Source column not found.");

            ProjectList? destColumn = await _db.ProjectLists.FindAsync(destColumnId);

            if (destColumn == null)
                throw new NotFoundException("Destination column not found.");

            Issue? issue = await _db.Issues.FindAsync(issueId);

            if (issue == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            issue.ProjectList = destColumn;

            foreach (var t in sourcePositions)
            {
                Issue? temp = await _db.Issues.FindAsync(t.Key);
                if (temp != null)
                {
                    temp.Position = t.Value;
                }
            }

            foreach (var t in destPositions)
            {
                Issue? temp = await _db.Issues.FindAsync(t.Key);
                if (temp != null)
                {
                    temp.Position = t.Value;
                }
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue status has changed by {userId} in project {projectId}.");
        }

        public async Task ChangePositionInColumn(Guid projectId, Guid columnId, Dictionary<Guid, int> positions)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? column = await _db.ProjectLists.FindAsync(columnId);
            
            if (column == null)
                throw new NotFoundException("Column not found.");

            foreach(var t in positions)        
            {
                Issue? temp = await _db.Issues.FindAsync(t.Key);
                if(temp != null)
                {
                    temp.Position = t.Value;
                }
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation($"Issue position has changed by {userId} in project {projectId}.");
        }

        public async Task DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId).FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            _db.Issues.Remove(i);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} deleted issue {issueId} from project list {projectListId} in project {projectId}");
        }

        public async Task RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            User? assignee = await _db.Users.FindAsync(assigneeId);
            User? u = await _db.Users.FindAsync(userId);

            if (assignee == null)
                throw new NotFoundException($"Assignee with id {assigneeId} not found.");

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");


            AssignedPerson? assignedPerson = await _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == assigneeId)
                .FirstOrDefaultAsync();

            if (assignedPerson == null)
                throw new NotFoundException($"Assignee with id {assigneeId} not found as assignee in this project");

            // Send notification
            if (assignee.Id != userId)
            {
                await _notificationService
                .SendNotification(assignee.Id, issueId,
                $"El lettél távolítva a(z) {i.Title} nevű feladat hozzárendelt személyei közül." +
                $" Módosító: {u.LastName + " " + u.FirstName}.");
            }

            _db.AssignedPeople.Remove(assignedPerson);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} has removed a user {assignee.Id} from issue {issueId} in project {projectId}.");
        }

        public async Task RemoveChildIssue(Guid projectId, Guid parentId, Guid childId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            Issue? parentIssue = await _db.Issues.FindAsync(parentId);

            if (parentIssue == null)
                throw new NotFoundException($"Issue with id {parentId} not found.");

            Issue? childIssue = await _db.Issues.FindAsync(childId);

            if (childIssue == null)
                throw new NotFoundException($"Issue with id {childId} not found.");

            if (childIssue.ParentIssueId != null)
            {
                childIssue.ParentIssueId = null;
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue with id {childId} in project {projectId} has removed from parent issue {parentId} by user {userId}.");
        }

        public async Task<Issue> UpdateIssueDetails(Guid projectId, Guid projectListId, Guid issueId, JsonPatchDocument<Issue> s)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? projectList = await _db.ProjectLists
                .Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException($"Project list with {projectListId} not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            List<AssignedPerson> assignedPeople = await _db.AssignedPeople.Where(p => p.IssueId == issueId).ToListAsync();

            foreach(var assignedPerson in assignedPeople)
            {
                if(userId != assignedPerson.UserId)
                {
                    await _notificationService
               .SendNotification(assignedPerson.UserId, issueId,
               $"Módosultak a(z) {i.Title} nevű feladat részletei." +
               $" Módosító: {user.LastName + " " + user.FirstName}.");
                }
            }

            foreach(var op in s.Operations)
            {
                if(op.path == "ParentIssueId")
                {
                    var i2 = await _db.Issues.FindAsync(op.value);

                    if (i2 == null)
                        throw new NotFoundException("Issue with id not found.");

                    if (i2.IssueType.Name == "Subtask")
                        throw new BadRequestException("Subtask can not be parent of task.");

                    i.ParentIssue = i2;
                }
            }

            s.ApplyTo(i);

            i.Updated = DateTime.Now;

            _db.Entry(i).State = EntityState.Modified;
            
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Issue {issueId} details changed by user {userId}.");
            return i;
        }
    }
}
