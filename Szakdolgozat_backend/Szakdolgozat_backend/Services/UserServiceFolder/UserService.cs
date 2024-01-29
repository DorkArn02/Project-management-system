using AutoMapper;
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
        private readonly IMapper _mapper;
        private readonly IHostEnvironment _hostingEnvironment;

        public UserService(DbCustomContext db, IHttpContextAccessor httpContextAccessor, IUserHelper userHelper, IMapper mapper, IHostEnvironment hostingEnvironment)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _userHelper = userHelper;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
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
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(userId);

            if (u == null)
                throw new NotFoundException("User not found.");

            List<Guid> projectIds = await _db.Participants.Where(p => p.UserId == userId)
                .Select(p => p.ProjectId).ToListAsync();

            List<User> relatedUsers = new();

            foreach(var projectID in projectIds)
            {
                List<Guid> userID = await _db.Participants
                    .Where(p => p.ProjectId == projectID)
                    .Select(p=>p.UserId).ToListAsync();

                foreach(var id in userID)
                {
                    User user = await _db.Users.FindAsync(id);

                    if(relatedUsers.Find(i=>i.Id == id) == null)
                        relatedUsers.Add(user);
                }
            }
           return _mapper.Map<List<UserInfoDTO>>(relatedUsers);
        }

        public async Task<UserInfoDTO> GetUserById(Guid userId)
        {
            Guid authorizedId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(authorizedId);

            if (u == null)
                throw new NotFoundException("User not found.");

            List<Guid> projectIds = await _db.Participants.Where(p => p.UserId == authorizedId)
                .Select(p => p.ProjectId).ToListAsync();

            User relatedUser = new();

            foreach (var projectID in projectIds)
            {
                var participant = await _db.Participants
                    .Where(p => p.ProjectId == projectID && p.UserId == userId)
                    .FirstOrDefaultAsync();

                if(participant.UserId != null)
                {
                    User user = await _db.Users.FindAsync(participant.UserId);
                    relatedUser = user;
                    break;
                }
            }
            return _mapper.Map<UserInfoDTO>(relatedUser);
        }

        public async Task UploadUserProfilePicture(IFormFile pictureDTO)
        {
            Guid authorizedId = _userHelper.GetAuthorizedUserGuid2(_httpContextAccessor);

            User? u = await _db.Users.FindAsync(authorizedId);

            if (u == null)
                throw new NotFoundException("User not found.");

            var item = pictureDTO;

            if (item.FileName == null || item.FileName.Length == 0)
            {
                throw new BadRequestException("File not selected");
            }

            string uploads = Path.Combine(_hostingEnvironment.ContentRootPath, "wwwroot");
            if (item.Length > 0)
            {
                string extension = Path.GetExtension(item.FileName);
                string filePath = Path.Combine(uploads, $"{u.Id}{extension}");
                using (Stream fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await item.CopyToAsync(fileStream);
                }
            }
        }
    }
}
