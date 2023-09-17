using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectListController : ControllerBase
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;

        public ProjectListController(DbCustomContext db, IUserHelper userHelper)
        {
            _db = db;
            _userHelper = userHelper;
        }

        [HttpPost("Add/{projectId}")]
        public IActionResult AddListToProject(Guid projectId, ProjectListRequestDTO listRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);
            Project? p = _db.Projects.Find(projectId);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            if (listRequestDTO.Position < 0)
            {
                return BadRequest("Position can't be negative");
            }

            bool positionDup = _db.ProjectLists.Where(p => p.ProjectId == projectId)
                .Any(p => p.Position == listRequestDTO.Position);

            if (positionDup)
            {
                return BadRequest("Position duplication not allowed");
            }

            ProjectList l = new()
            {
                Project = p,
                Title = listRequestDTO.Title,
                Color = listRequestDTO.Color,
                Position = listRequestDTO.Position
            };

            _db.ProjectLists.Add(l);
            _db.SaveChanges();

            return Ok(l);
        }

        [HttpGet("GetAll/{projectId}")]
        public IActionResult GetAllListByProject(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);
            Project? p = _db.Projects.Find(projectId);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            List<ProjectList> projectLists = _db.ProjectLists.Where(p => p.ProjectId == projectId)
                .Include(p=>p.Issues)
                    .ThenInclude(p=>p.AssignedPeople).AsQueryable()
                .ToList();

            List<ProjectListResponseDTO> projectListResponseDTO = new();

            foreach(var item in projectLists)
            {
                List<IssueResponseDTO> issueResponseDTOs = new();

                foreach(var issue in item.Issues.ToList())
                {
                    var issueReporter = _db.Users.Find(issue.UserId);
                    var issuePriority = _db.Priorities.Find(issue.PriorityId);

                    List<AssignedPersonDTO> assignedPersonDTOs = new();
                    
                    foreach(var assignedPerson in issue.AssignedPeople)
                    {
                        User u = _db.Users.Find(assignedPerson.UserId);

                        AssignedPersonDTO assignedPersonDTO = new()
                        {
                            Id = assignedPerson.Id,
                            IssueId = assignedPerson.IssueId,
                            UserId = assignedPerson.UserId,
                            PersonName = u.LastName + " " + u.FirstName
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
                    Color = item.Color,
                    Position = item.Position,
                    Title = item.Title,
                    ProjectId = item.ProjectId,
                    Issues = issueResponseDTOs
                };

                projectListResponseDTO.Add(itemDTO);
            }


            return Ok(projectListResponseDTO);

        }

        [HttpGet("Get/{projectId}/{projectListId}")]
        public IActionResult GetListByProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);
            Project? p = _db.Projects.Find(projectId);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? projectList = _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).Include(p=> p.Issues).FirstOrDefault();

            if(projectList == null)
            {
                return NotFound("Project list not found.");
            }

            return Ok(projectList);
        }

        [HttpDelete("Delete/{projectId}/{projectListId}")]
        public IActionResult DeleteListFromProject(Guid projectId, Guid projectListId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);
            Project? p = _db.Projects.Find(projectId);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? projectList = _db.ProjectLists.Where(p => p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefault();

            if(projectList == null)
            {
                return NotFound("Project list not found.");
            }

            _db.ProjectLists.Remove(projectList);
            _db.SaveChanges();

            return NoContent();
        }
    }
}
