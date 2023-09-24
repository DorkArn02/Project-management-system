using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.UserServiceFolder
{

    public class UserService : IUserService
    {

        private readonly DbCustomContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserHelper _userHelper;

        public UserService(DbCustomContext db, IHttpContextAccessor httpContextAccessor, IUserHelper userHelper)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _userHelper = userHelper;
        }

        public async Task ChangeUserPassword([FromBody] ChangePasswordRequestDTO changePasswordRequestDTO)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException("User not found.");



            if(!BCrypt.Net.BCrypt.Verify(changePasswordRequestDTO.oldPassword, u.PasswordHash))
                throw new Exceptions.UnauthorizedAccessException("Wrong credentials.");


            if (changePasswordRequestDTO.password1 != changePasswordRequestDTO.password2)
                throw new Exceptions.UnauthorizedAccessException("Wrong credentials.");

            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordRequestDTO.password1);
            await _db.SaveChangesAsync();
        }

        public async Task<List<UserInfoDTO>> GetAllResults()
        {
            List<User> users = await _db.Users.ToListAsync();
            List<UserInfoDTO> result = new();

            foreach (var user in users)
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
            return result;
        }

        public async Task<UserInfoDTO> GetUserById(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found.");

            UserInfoDTO u = new()
            {
                Email = user.Email,
                FirstName = user.FirstName,
                Id = user.Id,
                LastName = user.LastName,
                ProfilePic = user.ProfilePic,
                Registered = user.Registered
            };

            return u;
        }
    }
}
