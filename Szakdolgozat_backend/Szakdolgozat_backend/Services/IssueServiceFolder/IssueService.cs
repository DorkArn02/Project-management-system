using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.IssueServiceFolder
{
    public class IssueService : IIssueService
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public IssueService(DbCustomContext db, IUserHelper userHelper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _userHelper = userHelper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Issue> AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int assigneeId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");
            
            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException("Project list not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException("Issue not found.");

            Participant? participant = await _db.Participants.FindAsync(assigneeId);

            if (participant == null)
                throw new NotFoundException("User not found.");

            User? u = await _db.Users.FindAsync(participant.UserId);

            if (u == null)
                throw new NotFoundException("User not found.");

            AssignedPerson? assignedPerson = await _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == participant.UserId)
                .FirstOrDefaultAsync();

            if (assignedPerson != null)
                throw new UserConflictException("User already added as assignee");

            AssignedPerson assigned = new()
            {
                Issue = i,
                User = u
            };

            await _db.AssignedPeople.AddAsync(assigned);
            await _db.SaveChangesAsync();

            return i;
        }

        public async Task<Issue> AddIssueToProjectList(Guid projectId, Guid projectListId, IssueRequestDTO issueRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found.");

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

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
                throw new NotFoundException("Project list not found.");

            Priority? priority = await _db.Priorities.FindAsync(issueRequestDTO.PriorityId); ;

            if (priority == null)
                    throw new NotFoundException("Priority not found.");

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
                Priority = priority ?? null
            };

            await _db.Issues.AddAsync(i);
            await _db.SaveChangesAsync();

            return i;
        }

        public async Task<Issue> ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException("Project list not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException("Issue not found.");

            User? r = await _db.Users.FindAsync(reporterId);

            if (r == null)
                throw new NotFoundException("Reporter not found.");

            if (i.UserId == reporterId)
                throw new UserConflictException("User id can not be same.");

            i.User = r;

            _db.Issues.Update(i);
            await _db.SaveChangesAsync();

            return i;
        }

        public async Task ChangePositionBetweenColumns(Guid projectId, Guid sourceColumnId, Guid destColumnId, Guid issueId, Dictionary<Guid, int> sourcePositions, Dictionary<Guid, int> destPositions)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            ProjectList? sourceColumn = await _db.ProjectLists.FindAsync(sourceColumnId);

            if (sourceColumn == null)
                throw new NotFoundException("Source column not found.");

            ProjectList? destColumn = await _db.ProjectLists.FindAsync(destColumnId);

            if (destColumn == null)
                throw new NotFoundException("Destination column not found.");

            Issue? issue = await _db.Issues.FindAsync(issueId);

            if (issue == null)
                throw new NotFoundException("Issue not found.");

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
        }

        public async Task ChangePositionInColumn(Guid projectId, Guid columnId, Dictionary<Guid, int> positions)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

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
        }

        public async Task DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException("Project list not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId).FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException("Issue not found.");

            _db.Issues.Remove(i);
            await _db.SaveChangesAsync();
        }

        public async Task RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? pl = await _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId)
                .FirstOrDefaultAsync();

            if (pl == null)
                throw new NotFoundException("Project list not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException("Issue not found.");

            User? assignee = await _db.Users.FindAsync(assigneeId);

            if (assignee == null)
                throw new NotFoundException("Assignee not found.");

            AssignedPerson? assignedPerson = await _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == assigneeId)
                .FirstOrDefaultAsync();

            if (assignedPerson == null)
                throw new NotFoundException("User not found as assignee in this project");

            _db.AssignedPeople.Remove(assignedPerson);
            await _db.SaveChangesAsync();
        }

        public async Task<Issue> UpdateIssueDetails(Guid projectId, Guid projectListId, Guid issueId, JsonPatchDocument<Issue> s)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found.");

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? projectList = await _db.ProjectLists
                .Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException("Project list not found.");

            Issue? i = await _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefaultAsync();

            if (i == null)
                throw new NotFoundException("Issue not found.");
            /*
            i.Description = issueUpdateRequestDTO.Description;
            i.Title = issueUpdateRequestDTO.Title;
            i.Updated = DateTime.Now;
            i.DueDate = issueUpdateRequestDTO.DueDate;
            i.TimeEstimate = issueUpdateRequestDTO.TimeEstimate;
            i.TimeSpent = issueUpdateRequestDTO.TimeSpent;
            i.ProjectList = issueUpdateRequestDTO.ProjectList;
            */

            s.ApplyTo(i);

            i.Updated = DateTime.Now;

            _db.Entry(i).State = EntityState.Modified;
            
            await _db.SaveChangesAsync();
            return i;
        }
    }
}
