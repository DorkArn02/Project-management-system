using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssueController : ControllerBase
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;

        public IssueController(DbCustomContext db, IUserHelper userHelper)
        {
            _db = db;
            _userHelper = userHelper;
        }

        [HttpPost("AddIssue/{projectId}/{projectListId}")]
        public IActionResult AddIssueToProjectList(Guid projectId, Guid projectListId, IssueRequestDTO issueRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);
            Project? p = _db.Projects.Find(projectId);

            var user = _db.Users.Find(userId);

            if(user == null)
            {
                return NotFound("User not found.");
            }

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            if(issueRequestDTO.Position < 0)
            {
                return BadRequest("Position can't be negative");
            }

            bool positionDup = _db.Issues.Where(p => p.ProjectId == projectId && p.ProjectListId == projectListId)
                .Any(p => p.Position == issueRequestDTO.Position);

            if (positionDup)
            {
                return BadRequest("Position duplication not allowed");
            }

            ProjectList? projectList = _db.ProjectLists.Where(p=>p.ProjectId == projectId
            && p.Id == projectListId).FirstOrDefault(); 

            if(projectList == null)
            {
                return NotFound("Project list not found.");
            }

            if(_db.Priorities.Find(issueRequestDTO.PriorityId) == null)
            {
                return NotFound("Priority with id not found.");
            }

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

            _db.Issues.Add(i);
            _db.SaveChanges();

            return Ok(i);
        }

        [HttpDelete("DeleteIssue/{projectId}/{projectListId}/{issueId}")]
        public IActionResult DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId)
        {
            Project? p = _db.Projects.Find(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if(!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? pl = _db.ProjectLists
                .Where(x=>x.ProjectId == projectId && x.Id == projectListId).FirstOrDefault();

            if(pl == null)
            {
                return NotFound("Project list not found.");
            }

            Issue? i = _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId).FirstOrDefault();

            if(i == null)
            {
                return NotFound("Issue not found");
            }

            _db.Issues.Remove(i);
            _db.SaveChanges();

            return NoContent();
        }
        
        [HttpPost("AddAssignee/{projectId}/{projectListId}/{issueId}/{assigneeId}")]    
        public IActionResult AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int assigneeId)
        {
            Project? p = _db.Projects.Find(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? pl = _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId).FirstOrDefault();

            if (pl == null)
            {
                return NotFound("Project list not found.");
            }

            Issue? i = _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x=>x.AssignedPeople)
                .FirstOrDefault();

            if (i == null)
            {
                return NotFound("Issue not found");
            }

            Participant? participant = _db.Participants.Find(assigneeId);

            if(participant == null)
            {
                return NotFound("Assignee not found!");
            }

            User? u = _db.Users.Find(participant.UserId);

            if(u == null)
            {
                return NotFound("User not found");
            }

            AssignedPerson? assignedPerson = _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == participant.UserId).FirstOrDefault();

            if(assignedPerson != null)
            {
                return Conflict("User already added as assignee");
            }

            AssignedPerson assigned = new()
            {
                Issue = i,
                User = u
            };

            _db.AssignedPeople.Add(assigned);
            _db.SaveChanges();

            return Ok(i);
        }

        [HttpDelete("DeleteAssignee/{projectId}/{projectListId}/{issueId}/{assigneeId}")]
        public IActionResult RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId)
        {
            Project? p = _db.Projects.Find(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? pl = _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId).FirstOrDefault();

            if (pl == null)
            {
                return NotFound("Project list not found.");
            }

            Issue? i = _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefault();

            if (i == null)
            {
                return NotFound("Issue not found");
            }

            User? assignee = _db.Users.Find(assigneeId);

            if (assignee == null)
            {
                return NotFound("Assignee not found!");
            }

            AssignedPerson? assignedPerson = _db.AssignedPeople
                .Where(x => x.IssueId == issueId && x.UserId == assigneeId).FirstOrDefault();

            if (assignedPerson == null)
            {
                return Conflict("User not found as assignee in this project.");
            }

            _db.AssignedPeople.Remove(assignedPerson);
            _db.SaveChanges();

            return NoContent();
        }

        [HttpPut("ChangeIssueReporter/{projectId}/{projectListId}/{issueId}/{reporterId}")]
        public IActionResult ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId)
        {
            Project? p = _db.Projects.Find(projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized();
            }

            ProjectList? pl = _db.ProjectLists
                .Where(x => x.ProjectId == projectId && x.Id == projectListId).FirstOrDefault();

            if (pl == null)
            {
                return NotFound("Project list not found.");
            }

            Issue? i = _db.Issues.
                Where(x => x.ProjectId == projectId && x.ProjectListId == projectListId
                && x.Id == issueId)
                .Include(x => x.AssignedPeople)
                .FirstOrDefault();

            if (i == null)
            {
                return NotFound("Issue not found");
            }

            User? r = _db.Users.Find(reporterId);

            if(r == null)
            {
                return NotFound("User reporter not found.");
            }

            if(i.UserId == reporterId)
            {
                return Conflict("User id cannot be same");
            }

            i.User = r;

            _db.Issues.Update(i);
            _db.SaveChanges();

            return Ok(i);
        }
   
    }
}
