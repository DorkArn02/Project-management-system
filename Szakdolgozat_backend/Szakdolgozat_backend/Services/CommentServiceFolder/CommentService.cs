using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.CommentServiceFolder
{
    public class CommentService : ICommentService
    {
        private readonly DbCustomContext _db;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IUserHelper _userHelper;

        public CommentService(DbCustomContext db, IHttpContextAccessor contextAccessor, IUserHelper userHelper)
        {
            _db = db;
            _contextAccessor = contextAccessor;
            _userHelper = userHelper;
        }

        public async Task<Comment> AddCommentToIssue(Guid projectId, Guid issueId, string content)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException("User not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException("Issue not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User is not member of project.");

            Comment c = new()
            {
                Content = content,
                Created = DateTime.Now,
                Updated = DateTime.Now,
                Issue = i,
                User = u
            };

            await _db.Comments.AddAsync(c);
            await _db.SaveChangesAsync();

            return c;
        }

        public async Task<List<Comment>> GetCommentsFromIssue(Guid projectId, Guid issueId)
        {
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException("Issue not found.");

            List<Comment> c = await _db.Comments.Where(c => c.IssueId == issueId).ToListAsync();

            return c;
        }

        public async Task RemoveCommentFromIssue(Guid projectId, Guid issueId, Guid commentId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException("User not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException("Project not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException("Issue not found.");

            Comment? c = await _db.Comments.FindAsync(commentId);

            if (c == null)
                throw new NotFoundException("Comment not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User is not member of project.");

            if(c.UserId == userId)
            {
                _db.Comments.Remove(c);
                await _db.SaveChangesAsync();
            }
            else
            {
                throw new Exceptions.UnauthorizedAccessException("User is not comment owner.");
            }
        }
    }
}
