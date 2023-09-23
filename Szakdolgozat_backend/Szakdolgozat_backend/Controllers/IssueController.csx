using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Services.IssueServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssueController : ControllerBase
    {
        private readonly IIssueService _issueService;

        public IssueController(IIssueService issueService)
        {
            _issueService = issueService;
        }

        [HttpPost("AddIssue/{projectId}/{projectListId}")]
        public async Task<IActionResult> AddIssueToProjectList(Guid projectId, Guid projectListId, IssueRequestDTO issueRequestDTO)
        {
            var result = await _issueService.AddIssueToProjectList(projectId, projectListId, issueRequestDTO);

            return Ok(result);
        }

        [HttpDelete("DeleteIssue/{projectId}/{projectListId}/{issueId}")]
        public async Task<IActionResult> DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId)
        {
            await _issueService.DeleteIssueFromProjectList(projectId, projectListId, issueId);

            return NoContent();
        }
        
        [HttpPost("AddAssignee/{projectId}/{projectListId}/{issueId}/{assigneeId}")]    
        public async Task<IActionResult> AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int assigneeId)
        {
            var result = await _issueService.AddAssigneeToIssue(projectId, projectListId, issueId, assigneeId);

            return Ok(result);
        }

        [HttpDelete("DeleteAssignee/{projectId}/{projectListId}/{issueId}/{assigneeId}")]
        public async Task<IActionResult> RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId)
        {
            await _issueService.RemoveAssigneeFromIssue(projectId, projectListId, issueId, assigneeId);

            return NoContent();
        }

        [HttpPut("ChangeIssueReporter/{projectId}/{projectListId}/{issueId}/{reporterId}")]
        public async Task<ActionResult> ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId)
        {
            var result = await _issueService.ChangeIssueReporter(projectId, projectListId, issueId, reporterId);

            return Ok(result);
        }

        [HttpPut("ChangePosition/{projectId}/{sourceId}/{destId}/{sourceIssueId}/{destIssueId}")]
        public async Task<IActionResult> ChangePosition(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId)
        {
            await _issueService.ChangePosition(projectId, sourceId, destId, sourceIssueId, destIssueId);

            return Ok();
        }

        [HttpPut("ChangePosition2/{projectId}/{sourceId}/{destId}/{sourceIssueId}")]
        public async Task<IActionResult> ChangePosition2(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId)
        {
            await _issueService.ChangePosition2(projectId, sourceId, destId, sourceIssueId);

            return Ok();
        }

        [HttpPut("ChangePosition3/{projectId}/{sourceId}/{destId}/{sourceIssueId}/{destIssueId}")]
        public async Task<IActionResult> ChangePosition3(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId)
        {
            await _issueService.ChangePosition3(projectId, sourceId, destId, sourceIssueId, destIssueId);

            return Ok();
        }
    }
}
