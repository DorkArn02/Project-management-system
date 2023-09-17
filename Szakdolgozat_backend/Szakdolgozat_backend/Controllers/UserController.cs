using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly DbCustomContext _db;

        public UserController(DbCustomContext dbTesztContext)
        {
            _db = dbTesztContext;
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
    }
}
