using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.ProjectServiceFolder;
using Xunit.Abstractions;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class ProjectControllerTest
    {
        private readonly Mock<IProjectService> _projectService;
        private readonly IMapper _mapper;
        private readonly ITestOutputHelper _output;

        public ProjectControllerTest(ITestOutputHelper output)
        {
            _projectService = new Mock<IProjectService>();

            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
            _output = output;
        }

        [Fact]
        public async Task GetAllProjects()
        {
            // Arrange
            var projectList = MockData.GetProjects();
            _projectService.Setup(x => x.GetAllProjects())
                .Returns(Task.FromResult(_mapper.Map<List<ProjectResponseDTO>>(projectList)));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.GetAllProjects() as ObjectResult;
            var actualResult = result.Value;

            _output.WriteLine(((List<ProjectResponseDTO>)actualResult)[0].Title);


            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(projectList.Count, ((List<ProjectResponseDTO>)actualResult).Count);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetProjectById(Guid projectId)
        {
            // Arrange
            var project = MockData.GetProjects().FirstOrDefault(x => x.Id == projectId);
            _projectService.Setup(x => x.GetProjectById(projectId))
                .Returns(Task.FromResult(_mapper.Map<ProjectResponseDTO>(project)));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.GetProjectById(projectId) as ObjectResult;
            var actualResult = result.Value;

            _output.WriteLine(((ProjectResponseDTO)actualResult).Title);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task AddProject()
        {
            // Arrange
            ProjectRequestDTO projectRequestDTO = new()
            {
                Title = "New project",
                Description = "New description",
            };

            Project p = new()
            {
                Created = DateTime.Now,
                Updated = DateTime.Now,
                Title = projectRequestDTO.Title,
                Description = projectRequestDTO.Description
            };

            _projectService.Setup(x => x.AddProject(projectRequestDTO))
                .Returns(Task.FromResult(_mapper.Map<ProjectCreatedDTO>(p)));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.AddProject(projectRequestDTO) as ObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(projectRequestDTO.Title, ((ProjectCreatedDTO)actualResult).Title);
            Assert.Equal(projectRequestDTO.Description, ((ProjectCreatedDTO)actualResult).Description);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "example1@gmail.com")]
        public async Task AddUserToProject(Guid projectId, string email)
        {
            // Arrange
            _projectService.Setup(x => x.AddUserToProject(email, projectId))
                .Returns(Task.FromResult(true));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.AddUserToProject(email, projectId) as OkResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task DeleteProjectById(Guid projectId)
        {
            // Arrange
            _projectService.Setup(x => x.DeleteProjectById(projectId))
                .Returns(Task.FromResult(true));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.DeleteProjectById(projectId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a", "8699da70-f678-4a05-93ce-a387c98e5b81")]
        public async Task RemoveUserFromProject(Guid projectId, Guid existingUserId)
        {
            // Arrange
            _projectService.Setup(x => x.RemoveUserFromProject(existingUserId, projectId))
                .Returns(Task.FromResult(true));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.RemoveUserFromProject(existingUserId, projectId) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateProjectById()
        {
            // Arrange
            ProjectRequestDTO projectRequestDTO = new()
            {
                Title = "Updated project",
                Description = "Updated description",
            };

            Guid projectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a");

            var existingProject = MockData.GetProjects()
                .FirstOrDefault(p => p.Id == projectId);

            existingProject.Title = projectRequestDTO.Title;
            existingProject.Description = projectRequestDTO.Description;
            existingProject.Updated = DateTime.Now;

            _projectService.Setup(x => x.UpdateProjectById(projectId, projectRequestDTO))
                .Returns(Task.FromResult(_mapper.Map<ProjectCreatedDTO>(existingProject)));

            var projectController = new ProjectController(_projectService.Object);

            // Act
            var result = await projectController.UpdateProjectById(projectId, projectRequestDTO) as ObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal(projectRequestDTO.Title, ((ProjectCreatedDTO)actualResult).Title);
            Assert.Equal(projectRequestDTO.Description, ((ProjectCreatedDTO)actualResult).Description);

        }
    }
}