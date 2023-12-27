using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.NotificationDtos;
using Szakdolgozat_backend.Services.NotificationServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class NotificationControllerTest
    {
        private readonly Mock<INotificationService> _notificationService;
        private readonly IMapper _mapper;

        public NotificationControllerTest()
        {
            _notificationService = new Mock<INotificationService>();
            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public async Task GetUserNotifications()
        {
            // Arrange
            var notifications = MockData.GetNotifications().ToList();

            _notificationService.Setup(n => n.GetUserNotifications())
                .Returns(Task.FromResult(_mapper.Map<List<NotificationResponseDTO>>(notifications)));

            var notificationController = new NotificationController(_notificationService.Object);

            // Act
            var result = await notificationController.GetNotifications() as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        [Theory]
        [InlineData("8e14b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task DeleteNotificationById(Guid id)
        {
            // Arrange
            _notificationService.Setup(n => n.DeleteNotificationById(id))
                .Returns(Task.FromResult(true));

            var notificationController = new NotificationController(_notificationService.Object);

            // Act
            var result = await notificationController.DeleteNotification(id) as NoContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetNotificationsByProjectId(Guid projectId)
        {
            // Arrange
            var notifications = MockData.GetNotifications()
                .Where(x => x.ProjectId == projectId)
                .ToList();

            _notificationService.Setup(n => n.GetNotificationsByProjectId(projectId))
                .Returns(Task.FromResult(_mapper.Map<List<NotificationResponseDTO>>(notifications)));

            var notificationController = new NotificationController(_notificationService.Object);

            // Act
            var result = await notificationController.GetNotificationsByProjectId(projectId) as OkObjectResult;
            var actualResult = result.Value;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
