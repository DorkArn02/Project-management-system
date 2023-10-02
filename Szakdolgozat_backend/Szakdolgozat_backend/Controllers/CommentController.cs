using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Services.CommentServiceFolder;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost("AddComment/{projectId}/{issueId}")]
        public async Task<IActionResult> AddCommentToIssue(Guid projectId, Guid issueId, [FromBody] string content)
        {
            var result = await _commentService.AddCommentToIssue(projectId, issueId, content);

            return Ok(result);
        }

        [HttpGet("GetComment/{projectId}/{issueId}")]
        public async Task<IActionResult> GetCommentsFromIssue(Guid projectId, Guid issueId)
        {
            var result = await _commentService.GetCommentsFromIssue(projectId, issueId);

            return Ok(result);
        }

    }
}
