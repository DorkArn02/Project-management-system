using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.ProjectListServiceFolder
{
    public class ProjectListService : IProjectListService
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ProjectListService(DbCustomContext db, IUserHelper userHelper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _userHelper = userHelper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ProjectList> AddListToProject(Guid projectId, ProjectListRequestDTO listRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            if (listRequestDTO.Position < 0)
                throw new BadRequestException("Position can not be negative.");

            bool positionDup = await _db.ProjectLists.Where(p => p.ProjectId == projectId)
                .AnyAsync(p => p.Position == listRequestDTO.Position);

            if (positionDup)
                throw new BadRequestException("Position duplication not allowed");

            ProjectList l = new()
            {
                Project = p,
                Title = listRequestDTO.Title,
                Position = listRequestDTO.Position
            };

            await _db.ProjectLists.AddAsync(l);
            await _db.SaveChangesAsync();

            return l;
        }

        public async Task DeleteListFromProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? projectList = await _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException("Project list not found.");

            _db.ProjectLists.Remove(projectList);
            await _db.SaveChangesAsync();
        }

        public async Task<List<ProjectListResponseDTO>> GetAllListByProject(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User is not member of project.");

            List<ProjectList> projectLists = await _db.ProjectLists.Where(p => p.ProjectId == projectId)
                .Include(p => p.Issues)
                    .ThenInclude(p => p.AssignedPeople).AsQueryable()
                .ToListAsync();

            List<ProjectListResponseDTO> projectListResponseDTO = new();

            foreach (var item in projectLists)
            {
                List<IssueResponseDTO> issueResponseDTOs = new();

                foreach (var issue in item.Issues.ToList())
                {
                    var issueReporter = await _db.Users.FindAsync(issue.UserId);
                    var issuePriority = await _db.Priorities.FindAsync(issue.PriorityId);

                    List<AssignedPersonDTO> assignedPersonDTOs = new();

                    foreach (var assignedPerson in issue.AssignedPeople)
                    {
                        var u = await _db.Users.FindAsync(assignedPerson.UserId);

                        AssignedPersonDTO assignedPersonDTO = new()
                        {
                            Id = assignedPerson.Id,
                            IssueId = assignedPerson.IssueId,
                            UserId = assignedPerson.UserId,
                            PersonName = u!.LastName + " " + u.FirstName
                        };

                        assignedPersonDTOs.Add(assignedPersonDTO);
                    }

                    IssueResponseDTO issueDTO = new()
                    {
                        Id = issue.Id,
                        Description = issue.Description,
                        Created = issue.Created,
                        DueDate = issue.DueDate,
                        Position = issue.Position,
                        Title = issue.Title,
                        TimeEstimate = issue.TimeEstimate,
                        Updated = issue.Updated,
                        TimeSpent = issue.TimeSpent,
                        ReporterId = issue.UserId,
                        ReporterName = issueReporter.LastName + " " + issueReporter.FirstName,
                        Priority = issuePriority,
                        AssignedPeople = assignedPersonDTOs,
                        Comments = issue.Comments.ToList(),

                    };

                    issueResponseDTOs.Add(issueDTO);
                }

                ProjectListResponseDTO itemDTO = new()
                {
                    Id = item.Id,
                    Position = item.Position,
                    Title = item.Title,
                    ProjectId = item.ProjectId,
                    Issues = issueResponseDTOs.OrderBy(i => i.Position).ToList()
                };

                projectListResponseDTO.Add(itemDTO);
            }


            return projectListResponseDTO;
        }

        public async Task<ProjectList> GetListByProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            ProjectList? projectList = await _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).Include(p => p.Issues).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException("Project list not found.");

            return projectList;
        }

        public async Task<List<TaskResponseDTO>> GetPersonTasks()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new Exceptions.UnauthorizedAccessException("User not found.");

            List<AssignedPerson> assignedPeople = await _db.AssignedPeople
                .Where(x => x.UserId == userId).ToListAsync();

            List<Issue> issues = new();

            foreach(var p in assignedPeople)
            {
                Issue? i = await _db.Issues.Where(x => x.Id == p.IssueId).FirstOrDefaultAsync();

                if (i != null)
                    issues.Add(i);
            }

            List<TaskResponseDTO> issueResponseDTOs = new();

            foreach(var issue in issues)
            {
                var issueReporter = await _db.Users.FindAsync(issue.UserId);
                var issuePriority = await _db.Priorities.FindAsync(issue.PriorityId);
                var project = await _db.Projects.Where(x => x.Id == issue.ProjectId).FirstAsync();
                var board = await _db.ProjectLists
                .Where(x => x.ProjectId == issue.ProjectId && x.Id == issue.ProjectListId)
                .FirstAsync();

                var participant = await _db.Participants.Where(p => p.ProjectId == project.Id
                && p.UserId == userId).FirstOrDefaultAsync();

                if(participant != null)
                {
                    TaskResponseDTO issueDTO = new()
                    {
                        Id = issue.Id,
                        Description = issue.Description,
                        Created = issue.Created,
                        DueDate = issue.DueDate,
                        Position = issue.Position,
                        Title = issue.Title,
                        TimeEstimate = issue.TimeEstimate,
                        Updated = issue.Updated,
                        TimeSpent = issue.TimeSpent,
                        ReporterId = issue.UserId,
                        ReporterName = issueReporter.LastName + " " + issueReporter.FirstName,
                        Priority = issuePriority,
                        BoardName = board.Title,
                        ProjectName = project.Title
                    };
                    issueResponseDTOs.Add(issueDTO);
                }
            }
            return issueResponseDTOs;
        }
    }
}
