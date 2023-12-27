using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.AutoMapperProfiles;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Services.UserServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class UserControllerTest
    {
        private readonly Mock<IUserService> _userService;
        private readonly IMapper _mapper;

        public UserControllerTest()
        {
            _userService = new Mock<IUserService>();
            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ProfileList());
            });
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public async Task ChangeUserPassword()
        {
            // Arrange
            var changePasswordRequestDTO = new ChangePasswordRequestDTO()
            {
                oldPassword = "123",
                password1 = "asd123",
                password2 = "asd123"
            };

            _userService.Setup(u => u.ChangeUserPassword(changePasswordRequestDTO))
                .Returns(Task.FromResult(true));

            var userController = new UserController(_userService.Object);

            // Act
            var result = await userController.ChangeUserPassword(changePasswordRequestDTO) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetAllResults()
        {
            // Arrange
            var users = MockData.GetUsers();

            _userService.Setup(u => u.GetAllResults())
                .Returns(Task.FromResult(_mapper.Map<List<UserInfoDTO>>(users)));

            var userController = new UserController(_userService.Object);

            // Act
            var result = await userController.GetAllResults() as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }

        [Theory]
        [InlineData("8699da70-f678-4a05-93ce-a387c98e5b81")]
        public async Task GetUserById(Guid userId)
        {
            // Arrange
            var user = MockData.GetUsers()
                .Where(u=>u.Id==userId).First();

            _userService.Setup(u => u.GetUserById(userId))
                .Returns(Task.FromResult(_mapper.Map<UserInfoDTO>(user)));

            var userController = new UserController(_userService.Object);

            // Act
            var result = await userController.GetUserById(userId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
