using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.IssueServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class IssueControllerTest
    {
        private readonly Mock<IIssueService> _issueService;
        private readonly IMapper _mapper;

        public IssueControllerTest()
        {
            _issueService = new Mock<IIssueService>();
            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public async Task AddIssueToProjectList()
        {
            // Arrange
            Guid projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");
            Guid projectListId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a");

            IssueRequestDTO issueRequestDTO = new()
            {
                Description = "issue description",
                DueDate = DateTime.Now.AddDays(6),
                Position = 1,
                Title = "Issue title",
                TimeEstimate = 1,
                PriorityId = 1,
                IssueTypeId = 1
            };

            Issue i = new()
            {
                Title = issueRequestDTO.Title,
                Description = issueRequestDTO.Description,
                Created = DateTime.Now,
                Updated = DateTime.Now,
                DueDate = issueRequestDTO.DueDate,
                Position = issueRequestDTO.Position,
                TimeEstimate = issueRequestDTO.TimeEstimate,
                IssueTypeId = issueRequestDTO.IssueTypeId,
                PriorityId = issueRequestDTO.PriorityId
            };

            _issueService.Setup(i => i.AddIssueToProjectList(projectId, projectListId, issueRequestDTO))
                .Returns(Task.FromResult(i));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.AddIssueToProjectList(projectId, projectListId, issueRequestDTO) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(i, (Issue)actualResult);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId)
        {
            // Arrange
            _issueService.Setup(i => i.DeleteIssueFromProjectList(projectId, projectListId, issueId))
                .Returns(Task.FromResult(true));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.DeleteIssueFromProjectList(projectId, projectListId, issueId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", 1)]
        public async Task AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int participantId)
        {
            // Arrange
            var issue = MockData.GetIssues()
                .Where(i => i.ProjectId == projectId && i.ProjectListId == projectListId && i.Id == issueId)
                .First();

            _issueService.Setup(i => i.AddAssigneeToIssue(projectId, projectListId, issueId, participantId))
                .Returns(Task.FromResult(issue));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.AddAssigneeToIssue(projectId, projectListId, issueId, participantId) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((Issue)actualResult, issue);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", "6e94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId)
        {
            // Arrange
            _issueService.Setup(i => i.RemoveAssigneeFromIssue(projectId, projectListId, issueId, assigneeId))
                .Returns(Task.FromResult(true));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.RemoveAssigneeFromIssue(projectId, projectListId, issueId, assigneeId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", "5b94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task AddChildIssue(Guid projectId, Guid parentId, Guid childId)
        {
            // Arrange
            _issueService.Setup(i => i.AddChildIssue(projectId, parentId, childId))
                .Returns(Task.FromResult(true));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.AddChildIssue(projectId, parentId, childId) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "5b94b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task RemoveChildIssue(Guid projectId, Guid parentId, Guid childId)
        {
            // Arrange
            var issue = MockData.GetIssues().First();

            _issueService.Setup(i => i.RemoveChildIssue(projectId, parentId, childId))
                .Returns(Task.FromResult(issue));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.RemoveChildIssue(projectId, parentId, childId) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "4a94b1a1-93fb-4402-8b11-62937d75f87a", "8699da70-f678-4a05-93ce-a387c98e5b81")]
        public async Task ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId)
        {
            // Arrange
            var issue = MockData.GetIssues()
                .Where(i=>i.Id == issueId)
                .First();

            _issueService.Setup(i => i.ChangeIssueReporter(projectId, projectListId, issueId, reporterId))
                .Returns(Task.FromResult(issue));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.ChangeIssueReporter(projectId, projectListId, issueId, reporterId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ChangePositionBetweenColumns()
        {
            // Arrange
            Guid projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");
            Guid sourceColumnId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a");
            Guid destColumnId = Guid.Parse("6f94a1a1-93fb-4402-8b11-62937d75f87a");
            Guid issueId = Guid.Parse("4a94b1a1-93fb-4402-8b11-62937d75f87a");
            Dictionary<Guid, int> sourcePositions = new()
            {

            };
            Dictionary<Guid, int> destPositions = new()
            {

            };

            _issueService.Setup(i => i.ChangePositionBetweenColumns(projectId, sourceColumnId, destColumnId, issueId, sourcePositions, destPositions))
                .Returns(Task.FromResult(true));

            var issueController = new IssueController(_issueService.Object);

            var dto = new IssueColumnPositionChangeDTO()
            {
                sourcePositions = sourcePositions,
                destPositions = destPositions
            };

            // Act
            var result = await issueController.ChangePosition2(projectId, sourceColumnId, destColumnId, issueId, dto) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task ChangePositionInColumn()
        {
            // Arrange
            Guid projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");
            Guid columnId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a");
            Dictionary<Guid, int> positions = new ()
            {

            };

            _issueService.Setup(i => i.ChangePositionInColumn(projectId, columnId, positions))
                .Returns(Task.FromResult(true));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.ChangePosition1(projectId, columnId, positions) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task UpdateIssueDetails()
        {
            // Arrange
            Guid projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");
            Guid projectListId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a");
            Guid issueId = Guid.Parse("4a94b1a1-93fb-4402-8b11-62937d75f87a");
            JsonPatchDocument<Issue> s = new()
            {
            };

            var issue = MockData.GetIssues()
                .Where(i=>i.Id == issueId && i.ProjectId == projectId && i.ProjectListId == projectListId)
                .First();

            s.ApplyTo(issue);

            _issueService.Setup(i => i.UpdateIssueDetails(projectId, projectListId, issueId, s))
                .Returns(Task.FromResult(issue));

            var issueController = new IssueController(_issueService.Object);

            // Act
            var result = await issueController.UpdateIssueDetails(projectId, projectListId, issueId, s) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(issue, (Issue)actualResult);
        }
    }
}
