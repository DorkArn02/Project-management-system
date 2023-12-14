using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Hubs;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.NotificationServiceFolder;
using Szakdolgozat_backend.Services.ProjectServiceFolder;

namespace Szakdolgozat_backend.Test
{
    public class ProjectControllerTest
    {
        [Fact]
        public async Task GetAllProjects()
        {
            // Arrange
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService
                .Setup(service => service.GetAllProjects())
                .ReturnsAsync(new List<ProjectResponseDTO>());

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.GetAllProjects();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async void GetProjectById()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService
                .Setup(service => service.GetProjectById(projectId))
                .ReturnsAsync(new ProjectResponseDTO());

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.GetProjectById(projectId);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async void AddProject()
        {
            // Arrange
            var mockDb = new Mock<DbCustomContext>();
            var mockNotificationService = new Mock<INotificationService>();
            var mockUserHelper = new Mock<IUserHelper>();
            var mockLogger = new Mock<ILogger<ProjectService>>();
            var mockMessageHub = new Mock<IHubContext<MessageHub, IMessageHub>>();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService
                .Setup(service => service.AddProject(It.IsAny<ProjectRequestDTO>()))
                .ReturnsAsync(new ProjectCreatedDTO());

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.AddProject(new ProjectRequestDTO());

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async void AddUserToProject()
        {
            // Arrange
            var mockDb = new Mock<DbCustomContext>();
            var mockNotificationService = new Mock<INotificationService>();
            var mockUserHelper = new Mock<IUserHelper>();
            var mockLogger = new Mock<ILogger<ProjectService>>();
            var mockMessageHub = new Mock<IHubContext<MessageHub, IMessageHub>>();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService
                .Setup(service => service.AddUserToProject(It.IsAny<string>(), It.IsAny<Guid>()))
                .Returns(Task.CompletedTask);

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.AddUserToProject("test@example.com", Guid.NewGuid());

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async void DeleteProjectById()
        {
            // Arrange
            var mockDb = new Mock<DbCustomContext>();
            var mockNotificationService = new Mock<INotificationService>();
            var mockUserHelper = new Mock<IUserHelper>();
            var mockLogger = new Mock<ILogger<ProjectService>>();
            var mockMessageHub = new Mock<IHubContext<MessageHub, IMessageHub>>();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService.Setup(service => service.DeleteProjectById(It.IsAny<Guid>())).Returns(Task.CompletedTask);

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.DeleteProjectById(Guid.NewGuid());

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async void RemoveUserFromProject()
        {
            // Arrange
            var mockDb = new Mock<DbCustomContext>();
            var mockNotificationService = new Mock<INotificationService>();
            var mockUserHelper = new Mock<IUserHelper>();
            var mockLogger = new Mock<ILogger<ProjectService>>();
            var mockMessageHub = new Mock<IHubContext<MessageHub, IMessageHub>>();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService.Setup(service => service.RemoveUserFromProject(It.IsAny<Guid>(), It.IsAny<Guid>())).Returns(Task.CompletedTask);

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.RemoveUserFromProject(Guid.NewGuid(), Guid.NewGuid());

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async void UpdateProjectById()
        {
            // Arrange
            var mockDb = new Mock<DbCustomContext>();
            var mockNotificationService = new Mock<INotificationService>();
            var mockUserHelper = new Mock<IUserHelper>();
            var mockLogger = new Mock<ILogger<ProjectService>>();
            var mockMessageHub = new Mock<IHubContext<MessageHub, IMessageHub>>();
            var mockProjectService = new Mock<IProjectService>();
            mockProjectService.Setup(service => service.UpdateProjectById(It.IsAny<Guid>(), It.IsAny<ProjectRequestDTO>())).ReturnsAsync(new ProjectCreatedDTO());

            var controller = new ProjectController(mockProjectService.Object);

            // Act
            var result = await controller.UpdateProjectById(Guid.NewGuid(), new ProjectRequestDTO());

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}