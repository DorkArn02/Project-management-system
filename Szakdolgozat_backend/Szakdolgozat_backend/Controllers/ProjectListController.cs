﻿using Microsoft.AspNetCore.Authorization;
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
    }
}
