using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.CommentServiceFolder
{
    public interface ICommentService
    {
        Task<Comment> AddCommentToIssue(Guid projectId, Guid issueId, string content);
        Task RemoveCommentFromIssue(Guid projectId, Guid issueId, Guid commentId);
        Task<List<Comment>> GetCommentsFromIssue(Guid projectId, Guid issueId);
    }
}
