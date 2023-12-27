using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.ProjectListServiceFolder;
using Xunit.Abstractions;

namespace Szakdolgozat_backend.Test.ControllerTests
{

    public class ProjectListControllerTest
    {
        private readonly Mock<IProjectListService> _projectListService;
        private readonly IMapper _mapper;
        private readonly ITestOutputHelper _output;

        public ProjectListControllerTest(ITestOutputHelper output)
        {
            _projectListService = new Mock<IProjectListService>();

            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
            _output = output;
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetAllListByProject(Guid projectId)
        {
            // Arrange
            var projectLists = MockData.GetProjectLists()
                .Where(p => p.ProjectId == projectId).ToList();

            _projectListService.Setup(p => p.GetAllListByProject(projectId))
                .Returns(Task.FromResult(_mapper.Map<List<ProjectListResponseDTO>>(projectLists)));

            var projectListController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectListController.GetAllListByProject(projectId) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(projectLists.Count, ((List<ProjectListResponseDTO>)actualResult).Count);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetListByProject(Guid projectId, Guid projectListId)
        {
            // Arrange
            var projectList = MockData.GetProjectLists()
                .Where(p => p.ProjectId == projectId && p.Id == projectListId).First();

            _projectListService.Setup(p => p.GetListByProject(projectId, projectListId))
                .Returns(Task.FromResult(projectList));

            var projectListController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectListController.GetListByProject(projectId, projectListId) as OkObjectResult;
            var actualResult = result.Value;

            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((ProjectList)actualResult, projectList);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task DeleteListFromProject(Guid projectId, Guid projectListId)
        {
            // Arrange
            _projectListService.Setup(p => p.DeleteListFromProject(projectId, projectListId))
                .Returns(Task.FromResult(true));

            var projectController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectController.DeleteListFromProject(projectId, projectListId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task AddListToProject()
        {
            // Arrange
            var projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");
            var listRequestDTO = new ProjectListRequestDTO()
            {
                Position = 2,
                Title = "ToDo"
            };

            var projectList = new ProjectList()
            {
                Id = Guid.NewGuid(),
                Position = listRequestDTO.Position,
                ProjectId = projectId,
                Title = listRequestDTO.Title,
            };

            _projectListService.Setup(p => p.AddListToProject(projectId, listRequestDTO))
                .Returns(Task.FromResult(projectList));

            var projectController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectController.AddListToProject(projectId, listRequestDTO) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((ProjectList)actualResult, projectList);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "New title")]
        public async Task UpdateProjectList(Guid projectId, Guid projectListID, string title)
        {
            // Arrange
            var projectList = MockData.GetProjectLists()
                .Where(p => p.ProjectId == projectId && p.Id == projectListID).First();

            projectList.Title = title;

            _projectListService.Setup(p => p.UpdateProjectList(projectId, projectListID, title))
                .Returns(Task.FromResult(projectList));

            var projectController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectController.EditProjectList(projectId, projectListID, title) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(projectList.Title, ((ProjectList)actualResult).Title);
        }
        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "3f94b1a1-93fb-4402-8b11-62937d75f87a", "6f94a1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task UpdateProjectListPosition(Guid projectId, Guid projectListId1, Guid projectListId2)
        {
            // Arrange
            var projectList1 = MockData.GetProjectLists()
                .Where(p => p.ProjectId == projectId && p.Id == projectListId1).First();

            var projectList2 = MockData.GetProjectLists()
                .Where(p => p.ProjectId == projectId && p.Id == projectListId2).First();

            (projectList2.Position, projectList1.Position) = (projectList1.Position, projectList2.Position);

            _projectListService.Setup(p => p.UpdateProjectListPosition(projectId, projectListId1, projectListId2))
                .Returns(Task.FromResult(true));

            var projectController = new ProjectListController(_projectListService.Object);

            // Act
            var result = await projectController.EditProjectListPosition(projectId, projectListId1, projectListId2) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }
    }
}
