using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.AuditLogServiceFolder;

namespace Szakdolgozat_backend.Services.CommentServiceFolder
{
    public class CommentService : ICommentService
    {
        private readonly DbCustomContext _db;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IUserHelper _userHelper;
        private readonly ILogger<CommentService> _logger;
        private readonly IAuditLogService _auditLogService;

        public CommentService(DbCustomContext db, IHttpContextAccessor contextAccessor, IUserHelper userHelper, ILogger<CommentService> logger, IAuditLogService auditLogService)
        {
            _db = db;
            _contextAccessor = contextAccessor;
            _userHelper = userHelper;
            _logger = logger;
            _auditLogService = auditLogService;
        }

        public async Task<Comment> AddCommentToIssue(Guid projectId, Guid issueId, string content)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");

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

            await _auditLogService.AddAuditLog(projectId, $"A(z) {i.Title} nevű feladathoz hozzászólást rögzített.");

            _logger.LogInformation($"User with id {userId} added comment to issue {issueId} in project {projectId}.");

            return c;
        }

        public async Task<List<Comment>> GetCommentsFromIssue(Guid projectId, Guid issueId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);
            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");


            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            List<Comment> c = await _db.Comments.Where(c => c.IssueId == issueId).ToListAsync();

            _logger.LogInformation($"GetCommentsFromIssue called by user {userId}.");

            return c;
        }

        public async Task RemoveCommentFromIssue(Guid projectId, Guid issueId, Guid commentId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            Issue? i = await _db.Issues.FindAsync(issueId);

            if (i == null)
                throw new NotFoundException($"Issue with id {issueId} not found.");

            Comment? c = await _db.Comments.FindAsync(commentId);

            if (c == null)
                throw new NotFoundException($"Comment with id {commentId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");

            await _auditLogService.AddAuditLog(projectId, $"A(z) {i.Title} nevű feladatról hozzászólást törölt.");

            if (c.UserId == userId)
            {
                _db.Comments.Remove(c);
                await _db.SaveChangesAsync();
                _logger.LogInformation($"User with id {userId} deleted a comment from issue {issueId} in project {projectId}.");
            }
            else
            {
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not comment owner.");
            }
        }
    }
}
