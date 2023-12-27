using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.CommentServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class CommentControllerTest
    {
        private readonly Mock<ICommentService> _commentService;

        public CommentControllerTest()
        {
            _commentService = new Mock<ICommentService>();
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", "test content")]
        public async Task AddCommentToIssue(Guid projectId, Guid issueId, string content)
        {
            // Arrange
            var comment = new Comment()
            {
                Id = Guid.Parse("9d94b1a1-93fb-4402-8b11-62937d75f87a"),
                Content = "New comment",
                IssueId = issueId,
            };

            _commentService.Setup(c => c.AddCommentToIssue(projectId, issueId, content))
                .Returns(Task.FromResult(comment));

            var commentController = new CommentController(_commentService.Object);
            // Act
            var result = await commentController.AddCommentToIssue(projectId, issueId, content) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((Comment)actualResult, comment);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetCommentsFromIssue(Guid projectId, Guid issueId)
        {
            // Arrange

            var comments = MockData.GetComments()
                .Where(c => c.IssueId == issueId).ToList();

            _commentService.Setup(c => c.GetCommentsFromIssue(projectId, issueId))
                .Returns(Task.FromResult(comments));

            var commentController = new CommentController(_commentService.Object);

            // Act
            var result = await commentController.GetCommentsFromIssue(projectId, issueId) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(comments, (List<Comment>)actualResult);
        }
        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", "9d94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task RemoveCommentFromIssue(Guid projectId, Guid issueId, Guid commentId)
        {
            // Arrange
            _commentService.Setup(c => c.RemoveCommentFromIssue(projectId, issueId, commentId))
                .Returns(Task.FromResult(true));

            var commentController = new CommentController(_commentService.Object);

            // Act
            var result = await commentController.DeleteCommentFromIssue(projectId, issueId, commentId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }
    }
}
