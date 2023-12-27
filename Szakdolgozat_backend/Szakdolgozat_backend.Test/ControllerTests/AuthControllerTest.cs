using Microsoft.AspNetCore.Mvc;
using Moq;
using Szakdolgozat_backend.Controllers;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Services.AuthServiceFolder;

namespace Szakdolgozat_backend.Test.ControllerTests
{
    public class AuthControllerTest
    {
        private readonly Mock<IAuthService> _authService;

        public AuthControllerTest()
        {
            _authService = new Mock<IAuthService>();
        }

        [Fact]
        public async Task Register()
        {
            // Arrange

            var userRegisterRequestDTO = new UserRegisterRequestDTO()
            {
                Email = "example@gmail.com",
                ConfirmPassword = "asd123",
                Password = "asd123",
                FirstName = "John",
                LastName = "Doe"
            };

            var userRegisterResponseDTO = new UserRegisterResponseDTO()
            {
                Email = userRegisterRequestDTO.Email,
                LastName = userRegisterRequestDTO.LastName,
                FirstName = userRegisterRequestDTO.FirstName,
                Registered = DateTime.Now,
                Id = Guid.Parse("8699da70-f678-4a05-93ce-a387c98e5b81")
            };

            _authService.Setup(a => a.Register(userRegisterRequestDTO))
                .Returns(Task.FromResult(userRegisterResponseDTO));

            var authController = new AuthController(_authService.Object);

            // Act
            var result = await authController.Register(userRegisterRequestDTO) as OkObjectResult;
            var actualResult = result.Value;

            // Assign
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((UserRegisterResponseDTO)actualResult, userRegisterResponseDTO);
        }

        [Fact]
        public async Task Login()
        {
            // Arrange
            var userLoginRequestDTO = new UserLoginRequestDTO()
            {
                Email = "example@gmail.com",
                Password = "123"
            };

            var userLoginResponseDTO = new UserLoginResponseDTO()
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "example@gmail.com",
                Id = Guid.Parse("8699da70-f678-4a05-93ce-a387c98e5b81"),
                Registered = DateTime.Now,
                AccessToken = "123"
            };

            _authService.Setup(a => a.Login(userLoginRequestDTO))
                .Returns(Task.FromResult(userLoginResponseDTO));

            var authController = new AuthController(_authService.Object);

            // Act
            var result = await authController.Login(userLoginRequestDTO) as OkObjectResult;
            var actualResult = result.Value;

            // Result
            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
            Assert.Equal((UserLoginResponseDTO)actualResult, userLoginResponseDTO);
        }
    }
}
