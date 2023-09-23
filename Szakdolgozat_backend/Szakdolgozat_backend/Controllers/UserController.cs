using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;

        public UserController(DbCustomContext dbTesztContext, IUserHelper userHelper)
        {
            _db = dbTesztContext;
            _userHelper = userHelper;
        }

        [HttpGet("get/{userId}")]
        public IActionResult GetUserById(Guid userId)
        {
            var user = _db.Users.Find(userId);

            if(user == null)
            {
                return NotFound("User not found.");
            }

            UserInfoDTO u = new()
            {
                Email = user.Email,
                FirstName = user.FirstName,
                Id = user.Id,
                LastName = user.LastName,
                ProfilePic = user.ProfilePic,
                Registered = user.Registered
            };

            return Ok(u);
        }

        [HttpGet("GetAll")]
        public IActionResult GetAllResults()
        {
            List<User> users = _db.Users.ToList();
            List<UserInfoDTO> result = new();

            foreach(var user in users)
            {
                UserInfoDTO u = new()
                {
                    Email = user.Email,
                    FirstName = user.FirstName,
                    Id = user.Id,
                    LastName = user.LastName,
                    ProfilePic = user.ProfilePic,
                    Registered = user.Registered
                };

                result.Add(u);
            }
            return Ok(result);
        }

        [HttpPut("PasswordChange")]
        public IActionResult ChangeUserPassword(string oldPassword, string password1, string password2)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid(this);

            User? u = _db.Users.Find(userId);

            if(u == null)
            {
                return NotFound();
            }

            string passwordHash =
                BCrypt.Net.BCrypt.HashPassword(oldPassword);

            if(passwordHash != u.PasswordHash)
            {
                return Unauthorized();
            }

            if(password1 != password2)
            {
                return Unauthorized();
            }

            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password1);
            _db.SaveChanges();

            return Ok("Password changed");
        }
    }
}
