using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Services.ProjectServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddProject(ProjectRequestDTO p)
        {
            var project = await _projectService.AddProject(p);
            return Ok(project);
        }

        [HttpGet("Get/{projectId}")]
        public async Task<IActionResult> GetProjectById(Guid projectId)
        {
            var project = await _projectService.GetProjectById(projectId);
            return Ok(project);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllProjects()
        {
            var projects = await _projectService.GetAllProjects();
            return Ok(projects);
        }
        
        [HttpDelete("Delete/{projectId}")]
        public async Task<IActionResult> DeleteProjectById(Guid projectId)
        {
            await _projectService.DeleteProjectById(projectId);
            return NoContent();
        }
        
        [HttpPut("Update/{projectId}")]
        public async Task<IActionResult> UpdateProjectById(Guid projectId, ProjectRequestDTO projectRequestDTO)
        {
            var project = await _projectService.UpdateProjectById(projectId, projectRequestDTO); 
            return Ok(project);
        }
        
        [HttpPost("AddUser/{projectId}")]
        public async Task<IActionResult> AddUserToProject([FromBody]string email, Guid projectId)
        {
            await _projectService.AddUserToProject(email, projectId);
            return Ok();
        }
        
        [HttpDelete("RemoveUser/{projectId}/{existingUserId}")]
        public async Task<IActionResult> RemoveUserFromProject(Guid existingUserId, Guid projectId)
        {
            await _projectService.RemoveUserFromProject(existingUserId, projectId);
            return NoContent();
        }
    }
}
