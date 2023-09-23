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
                throw new NotFoundException("Assignee not found.");

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

            if (await _db.Priorities.FindAsync(issueRequestDTO.PriorityId) == null)
                throw new NotFoundException("Priority not found.");

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
                PriorityId = issueRequestDTO.PriorityId
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

        public async Task ChangePosition(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            ProjectList? source = await _db.ProjectLists.FindAsync(sourceId);

            if (source == null)
                throw new NotFoundException("Source list not found.");

            ProjectList? dest = await _db.ProjectLists.FindAsync(destId);

            if (dest == null)
                throw new NotFoundException("Destination list not found.");

            Issue? sourceIssue = await _db.Issues.FindAsync(sourceIssueId);
            Issue? destIssue = await _db.Issues.FindAsync(destIssueId);

            if (sourceIssue == null)
                throw new NotFoundException("Source issue not found.");

            if (destIssue == null)
                throw new NotFoundException("Destination issue not found.");

            // Move inside list
            if (sourceId == destId)
            {
                int sourcePos = sourceIssue.Position;
                int destPos = destIssue.Position;

                sourceIssue.Position = destPos;
                destIssue.Position = sourcePos;

            }
            // Move between to list
            else
            {
                int sourcePos = sourceIssue.Position;
                int destPos = destIssue.Position;

                sourceIssue.ProjectList = dest;

                sourceIssue.Position = destPos;
                destIssue.Position = sourcePos;
            }

            await _db.SaveChangesAsync();
        }

        public async Task ChangePosition2(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            ProjectList? source = await _db.ProjectLists.FindAsync(sourceId);

            if (source == null)
                throw new NotFoundException("Source list not found.");

            ProjectList? dest = await _db.ProjectLists.FindAsync(destId);

            if (dest == null)
                throw new NotFoundException("Destination list not found.");

            Issue? sourceIssue = await _db.Issues.FindAsync(sourceIssueId);

            if (sourceIssue == null)
                throw new NotFoundException("Source issue not found.");

            sourceIssue.Position = 1;
            sourceIssue.ProjectList = dest;

            await _db.SaveChangesAsync();
        }

        public async Task ChangePosition3(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            ProjectList? source = await _db.ProjectLists.FindAsync(sourceId);

            if (source == null)
                throw new NotFoundException("Source list not found.");


            ProjectList? dest = await _db.ProjectLists.FindAsync(destId);

            if (dest == null)
                throw new NotFoundException("Destination list not found.");


            Issue? sourceIssue = await _db.Issues.FindAsync(sourceIssueId);
            Issue? destIssue = await _db.Issues.FindAsync(destIssueId);

            if (sourceIssue == null)
                throw new NotFoundException("Source issue not found.");


            if (destIssue == null)
                throw new NotFoundException("Destination issue not found.");

            sourceIssue.Position = destIssue.Position + 1;
            sourceIssue.ProjectList = dest;

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
    }
}
