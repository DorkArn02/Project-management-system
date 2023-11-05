using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.CommentDtos;
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
        private readonly ILogger<ProjectListService> _logger;
        public ProjectListService(DbCustomContext db, IUserHelper userHelper, IHttpContextAccessor httpContextAccessor, ILogger<ProjectListService> logger)
        {
            _db = db;
            _userHelper = userHelper;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<ProjectList> AddListToProject(Guid projectId, ProjectListRequestDTO listRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project not found with id {projectId}.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

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

            _logger.LogInformation($"User with id {userId} has added a list to project {p.Id}.");

            return l;
        }

        public async Task DeleteListFromProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            ProjectList? projectList = await _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            _db.ProjectLists.Remove(projectList);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User with id {userId} has removed list {projectList.Id} from project {p.Id}.");

        }

        public async Task<List<ProjectListResponseDTO>> GetAllListByProject(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");

            List<ProjectList> projectLists = await _db.ProjectLists.Where(p => p.ProjectId == projectId)
                .Include(p => p.Issues)
                    .ThenInclude(p => p.AssignedPeople)
                    .AsQueryable()
                .ToListAsync();

            List<ProjectListResponseDTO> projectListResponseDTO = new();

            foreach (var item in projectLists)
            {
                List<IssueResponseDTO> issueResponseDTOs = new();

                foreach (var issue in item.Issues.ToList())
                {
                    var issueReporter = await _db.Users.FindAsync(issue.UserId);
                    var issuePriority = await _db.Priorities.FindAsync(issue.PriorityId);
                    var comment = await _db.Comments
                        .Where(c => c.IssueId == issue.Id)
                        .ToListAsync();
                    var issueType = await _db.IssueTypes.FindAsync(issue.IssueTypeId);

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

                    List<CommentResponseDTO> commentResponseDTOs = new();

                    foreach(var c in comment)
                    {
                        var user = await _db.Users.FindAsync(c.UserId);

                        if (user == null)
                            throw new NotFoundException($"User with id {c.UserId} not found.");

                        CommentResponseDTO commentResponseDTO = new()
                        {
                            Content = c.Content,
                            Created = c.Created,
                            Updated = c.Updated,
                            IssueId = c.IssueId,
                            Id = c.Id,
                            UserId = c.UserId,
                            AuthorName = $"{user.LastName} {user.FirstName}"
                        };

                        commentResponseDTOs.Add(commentResponseDTO);
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
                        Comments = commentResponseDTOs,
                        IssueType = issueType
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

            _logger.LogInformation($"GetAllListByProject called by user {userId} and project id {p.Id}.");

            return projectListResponseDTO.OrderBy(p=>p.Position).ToList();
        }

        public async Task<ProjectList> GetListByProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not member of project.");

            ProjectList? projectList = await _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).Include(p => p.Issues).FirstOrDefaultAsync();

            if (projectList == null)
                throw new NotFoundException($"Project list with id {projectListId} not found.");

            _logger.LogInformation($"GetListByProject called by user {userId} and project id {p.Id} and project list id {projectList.Id}.");

            return projectList;
        }

        public async Task<List<TaskResponseDTO>> GetPersonTasks()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not found.");

            List<AssignedPerson> assignedPeople = await _db.AssignedPeople
                .Where(x => x.UserId == userId).ToListAsync();

            List<Issue> issues = new();

            foreach(var p in assignedPeople)
            {
                Issue? i = await _db.Issues.Where(x => x.Id == p.IssueId).FirstOrDefaultAsync();

                if (i != null)
                    issues.Add(i);
            }

            List<TaskResponseDTO> taskResponseDTOs = new();

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

                var issueType = await _db.IssueTypes.FindAsync(issue.IssueTypeId);

                if (participant != null)
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
                        ProjectName = project.Title,
                        IssueType = issueType
                    };
                    taskResponseDTOs.Add(issueDTO);
                }
            }
            _logger.LogInformation($"GetPersonTasks called by user id {userId}.");

            return taskResponseDTOs;
        }

        public async Task<List<TaskResponseDTO>> GetPersonTasksByProjectId(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} not found.");

            List<AssignedPerson> assignedPeople = await _db.AssignedPeople
                .Where(x => x.UserId == userId).ToListAsync();

            List<Issue> issues = new();

            foreach (var p in assignedPeople)
            {
                Issue? i = await _db.Issues.Where(x => x.Id == p.IssueId && x.ProjectId == projectId).FirstOrDefaultAsync();

                if (i != null)
                    issues.Add(i);
            }

            List<TaskResponseDTO> taskResponseDTOs = new();

            foreach (var issue in issues)
            {
                var issueReporter = await _db.Users.FindAsync(issue.UserId);
                var issuePriority = await _db.Priorities.FindAsync(issue.PriorityId);
                var project = await _db.Projects.Where(x => x.Id == issue.ProjectId).FirstAsync();
                var board = await _db.ProjectLists
                .Where(x => x.ProjectId == issue.ProjectId && x.Id == issue.ProjectListId)
                .FirstAsync();

                var participant = await _db.Participants.Where(p => p.ProjectId == project.Id
                && p.UserId == userId).FirstOrDefaultAsync();

                var issueType = await _db.IssueTypes.FindAsync(issue.IssueTypeId);

                if (participant != null)
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
                        ProjectName = project.Title,
                        IssueType = issueType
                    };
                    taskResponseDTOs.Add(issueDTO);
                }
            }
            _logger.LogInformation($"GetPersonTasks called by user id {userId}.");

            return taskResponseDTOs;
        }

        public async Task<ProjectList> UpdateProjectList(Guid projectId, Guid projectListID, string title)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);
            ProjectList? projectList = await _db.ProjectLists.FindAsync(projectListID);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (projectList == null)
                throw new NotFoundException($"Project list with id {projectListID} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            projectList.Title = title;

            _db.ProjectLists.Update(projectList);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"Project list {projectList.Id} updated by user {userId} in project {p.Id}.");

            return projectList;
        }

        public async Task UpdateProjectListPosition(Guid projectId, Guid projectListId1, Guid projectListId2)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);
            ProjectList? projectList1 = await _db.ProjectLists.FindAsync(projectListId1);
            ProjectList? projectList2 = await _db.ProjectLists.FindAsync(projectListId2);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (projectList1 == null)
                throw new NotFoundException($"Project list with id {projectListId1} not found.");

            if (projectList2 == null)
                throw new NotFoundException($"Project list with id {projectListId2} not found.");

            if (!_userHelper.IsUserOwnerOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not project owner.");

            int temp = projectList1.Position;

            projectList1.Position = projectList2.Position;
            projectList2.Position = temp;

            await _db.SaveChangesAsync();

            _logger.LogInformation($"Project list position {projectList1.Id} and {projectList2.Id} updated by user {userId} in project {p.Id}.");
        }
    }
}
