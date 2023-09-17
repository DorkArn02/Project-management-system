using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IMapper _iMapper;

        public ProjectController(DbCustomContext customContext, IUserHelper userHelper, IMapper iMapper)
        {
            _db = customContext;
            _userHelper = userHelper;
            _iMapper = iMapper;
        }

        // Ok
        [HttpPost("Add")]
        public IActionResult AddProject(ProjectRequestDTO p)
        {
            // 1. Create project
            Project newProject = new()
            {
                Created = DateTime.Now,
                Updated = DateTime.Now,
                Description = p.Description,
                IconName = p.IconName,
                Title = p.Title
            };

            _db.Projects.Add(newProject);
            _db.SaveChanges();

            // 2. Add project owner to participants table
            var role = _db.Roles.First(i => i.Id == 1);
            var user = _db.Users
                .First(i => i.Id == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)));

            Participant participant = new()
            {
                Project = newProject,
                Role = role,
                User = user,
            };

            _db.Participants.Add(participant);
            _db.SaveChanges();

            // 3. Get ProjectCreatedDTO
            return Ok(_iMapper.Map<ProjectCreatedDTO>(newProject));
        }

        // Ok
        [HttpGet("Get/{projectId}")]
        public IActionResult GetProjectById(Guid projectId)
        {
            // 1. Get authorized user id
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            // 2. Get project with id and include participants and boards
            Project? existingProject = _db.Projects
                .Where(project=>project.Id==projectId)
                .Include(project=>project.Participants)
                .Include(project=>project.ProjectLists)
                .FirstOrDefault();
           
            // 3. If project is null or user is not member of this project
            if(existingProject == null)
            {
                return NotFound("Project not found.");
            }

            if(!_userHelper.IsUserMemberOfProject(userId, existingProject.Id))
            {
                return Unauthorized();
            }

            List<ParticipantResponseDTO> participantResponseDTO = new();

            // 4. Create Participant DTO
            foreach (var participant in existingProject.Participants)
            {
                string firstName = _db.Users
                    .Where(user => user.Id == participant.UserId)
                    .First()
                    .FirstName;

                string lastName = _db.Users
                    .Where(user => user.Id == participant.UserId)
                    .First()
                    .LastName;

                string roleName = _db.Roles
                    .Where(role => role.Id == participant.RoleId)
                    .First()
                    .Name;

                ParticipantResponseDTO participantResponse = new()
                {
                    Id = participant.Id,
                    FirstName = firstName,
                    LastName = lastName,
                    RoleName = roleName ,
                    UserId = participant.UserId
                };

                participantResponseDTO.Add(participantResponse);
            }

            // 5. Create DTO to display user's details instead of ids
            ProjectResponseDTO projectResponseDTO = new()
            {
                Created = existingProject.Created,
                Updated = existingProject.Updated,
                Id = existingProject.Id,
                Description = existingProject.Description,
                IconName = existingProject.IconName,
                Title = existingProject.Title,
                //ProjectLists = existingProject.ProjectLists,
                Participants = participantResponseDTO
            };

            return Ok(projectResponseDTO);
        }

        // Ok
        [HttpGet("GetAll")]
        public IActionResult GetAllProjects()
        {
            // 1. Get authorized user id
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            // 2. Get user's projects
            var userProjects = _db.Projects
            .Where(project => _db.Participants.Any(participant => participant.ProjectId == project.Id && participant.UserId == userId))
            .Include(project => project.Participants)
            .Include(project => project.ProjectLists)
            .ToList();

            List<ProjectResponseDTO> projectResponseDTOs = new();

            // 3. Iterate through user's projects
            foreach(var project in userProjects)
            {
                var part = project.Participants.ToList();
                var partResp = new List<ParticipantResponseDTO>();

                // 4. Make participants DTO
                foreach(var participant in part)
                {
                    var role = _db.Roles.Find(participant.RoleId);
                    string roleName = role != null ? role.Name : "Unknown Role";

                    string firstName = _db.Users.Find(participant.UserId).FirstName;
                    string lastName = _db.Users.Find(participant.UserId).LastName;

                    ParticipantResponseDTO participantResponseDTO = new()
                    {
                        Id = participant.Id,
                        FirstName = firstName,
                        LastName = lastName,
                        RoleName = roleName,
                        UserId = participant.UserId
                    };

                    partResp.Add(participantResponseDTO);
                }
                // 5. Make ProjectResponse DTO
                projectResponseDTOs.Add(new ProjectResponseDTO()
                {
                    Id = project.Id,
                    Created = project.Created,
                    Description = project.Description,
                    IconName = project.IconName,
                    //ProjectLists = project.ProjectLists,
                    Title = project.Title,
                    Updated = project.Updated,
                    Participants = partResp
                });
            }

            return Ok(projectResponseDTOs);
        }

        // Ok
        [HttpDelete("Delete/{projectId}")]
        public IActionResult DeleteProjectById(Guid projectId)
        {
            Project? existingProject = _db.Projects.FirstOrDefault(project => project.Id == projectId);
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (existingProject == null)
            {
                return NotFound("Project not found.");
            }

            // Project <--> User <--> Role is Owner (id=1)
            Participant? participant = _db.Participants
                .Where(part => part.ProjectId == projectId && part.UserId == userId && part.RoleId == 1).FirstOrDefault();
            
            if(participant == null)
            {
                return Unauthorized();
            }

            _db.Projects.Remove(existingProject);
            _db.SaveChanges();

            return NoContent();
        }

        // Ok
        [HttpPut("Update/{projectId}")]
        public IActionResult UpdateProjectById(Guid projectId, ProjectRequestDTO projectRequestDTO)
        {
            Project? existingProject = _db.Projects.FirstOrDefault(i => i.Id == projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            if (existingProject == null)
            {
                return NotFound("Project not found.");
            }
            // Project <--> User <--> Role is Owner (id=1)
            Participant? participant = _db.Participants.Where(part => part.ProjectId == projectId
            && part.UserId == userId && part.RoleId == 1).FirstOrDefault();

            if (participant == null)
            {
                return Unauthorized();
            }

            existingProject.Title = projectRequestDTO.Title;
            existingProject.Updated = DateTime.Now;
            existingProject.Description = projectRequestDTO.Description;
            existingProject.IconName = projectRequestDTO.IconName;

            _db.Projects.Update(existingProject);
            _db.SaveChanges();

            return Ok(_iMapper.Map<ProjectCreatedDTO>(existingProject));
        }

        [HttpPost("AddUser/{projectId}")]
        public IActionResult AddUserToProject([FromBody]string email, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            Project? p = _db.Projects.Find(projectId);
            User? u = _db.Users.FirstOrDefault(i=> i.Email == email);
            Role? r = _db.Roles.Find(2); // Role member

            if(p == null)
            {
                return NotFound("Project not found.");
            }

            if(r == null)
            {
                return NotFound("Role not found.");
            }

            if(u == null)
            {
                return NotFound("Megadott e-mail címmel egyetlen felhasználó sem található");
            }

            // User is not member of the project
            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized("Kérem töltse újra a weboldalt.");
            }

            // New User already added
            if (_userHelper.IsUserMemberOfProject(u.Id, projectId))
            {
                return Conflict("A megadott felhasználó már tagja a projektnek.");
            }

            Participant participant = new()
            {
                Project = p,
                User = u,
                Role = r
            };

            _db.Participants.Add(participant);
            _db.SaveChanges();

            return Ok();
        }

        [HttpDelete("RemoveUser/{projectId}")]
        public IActionResult RemoveUserFromProject([FromBody] Guid existingUserId, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            Project? p = _db.Projects.Find(projectId);
            User? u = _db.Users.Find(existingUserId);
            Role? r = _db.Roles.Find(2); // Role member

            if (p == null)
            {
                return NotFound("Project not found.");
            }

            if (r == null)
            {
                return NotFound("Role not found.");
            }

            if (u == null)
            {
                return NotFound("Megadott e-mail címmel egyetlen felhasználó sem található");
            }

            // User is not member of the project
            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
            {
                return Unauthorized("Kérem töltse újra a weboldalt.");
            }

            // Existing user is not member of this project
            if (!_userHelper.IsUserMemberOfProject(existingUserId, projectId))
            {
                return Conflict("A megadott felhasználó nem tagja ennek a projektnek.");
            }

            Participant participant = _db.Participants
                .Where(p => p.ProjectId == projectId && p.UserId == existingUserId)
                .First();

            _db.Participants.Remove(participant);
            _db.SaveChanges();

            return NoContent();
        }
    }
}
