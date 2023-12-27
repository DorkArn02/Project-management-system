using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.AuditLogDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.AuditLogServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class AuditLogControllerTest
    {
        private readonly Mock<IAuditLogService> _auditLogService;
        private readonly IMapper _mapper;

        public AuditLogControllerTest()
        {
            _auditLogService = new Mock<IAuditLogService>();
            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
        }

        [Theory]
        [InlineData("1f90b1a1-93fb-4402-8b11-62937d75f87a")]
        public async Task GetAuditLogsByProjectId(Guid projectId)
        {
            // Arrange
            var auditLogs = MockData.GetAuditLogs();

            _auditLogService.Setup(a => a.GetAuditLogs(projectId))
                .Returns(Task.FromResult(_mapper.Map<List<AuditLogResponseDTO>>(auditLogs)));

            var auditLogController = new AuditLogController(_auditLogService.Object);

            // Act
            var result = await auditLogController.GetAuditLogsByProjectId(projectId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);


        }
    }
}
