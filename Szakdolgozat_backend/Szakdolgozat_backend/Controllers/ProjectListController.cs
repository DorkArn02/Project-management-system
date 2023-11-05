using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Services.ProjectListServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectListController : ControllerBase
    {
        private readonly IProjectListService _projectListService;

        public ProjectListController(IProjectListService projectListService)
        {
            _projectListService = projectListService;
        }

        [HttpPost("Add/{projectId}")]
        public async Task<IActionResult> AddListToProject(Guid projectId, ProjectListRequestDTO listRequestDTO)
        {
            var result = await _projectListService.AddListToProject(projectId, listRequestDTO);

            return Ok(result);
        }

        [HttpGet("GetAll/{projectId}")]
        public async Task<IActionResult> GetAllListByProject(Guid projectId)
        {
            var result = await _projectListService.GetAllListByProject(projectId);

            return Ok(result);
        }

        [HttpGet("Get/{projectId}/{projectListId}")]
        public async Task<IActionResult> GetListByProject(Guid projectId, Guid projectListId)
        {
            var result = await _projectListService.GetListByProject(projectId, projectListId);

            return Ok(result);
        }

        [HttpDelete("Delete/{projectId}/{projectListId}")]
        public async Task<IActionResult> DeleteListFromProject(Guid projectId, Guid projectListId)
        {
            await _projectListService.DeleteListFromProject(projectId, projectListId);

            return NoContent();
        }

        [HttpGet("GetTasks/")]
        public async Task<IActionResult> GetPersonTasks()
        {
            var result = await _projectListService.GetPersonTasks();

            return Ok(result);
        }

        [HttpGet("GetTasksByProjectId/{projectId}")]
        public async Task<IActionResult> GetTasksByProjectId(Guid projectId)
        {
            var result = await _projectListService.GetPersonTasksByProjectId(projectId);

            return Ok(result);
        }

        [HttpPut("Edit/{projectId}/{projectListId}")]
        public async Task<IActionResult> EditProjectList(Guid projectId, Guid projectListId, [FromBody] string title)
        {
            var result = await _projectListService.UpdateProjectList(projectId, projectListId, title);

            return Ok(result);
        }

        [HttpPut("Edit/{projectId}/{projectListId1}/{projectListId2}")]
        public async Task<IActionResult> EditProjectListPosition(Guid projectId, Guid projectListId1, Guid projectListId2)
        {
            await _projectListService.UpdateProjectListPosition(projectId, projectListId1, projectListId2);
            return Ok();
        }
    }
}
