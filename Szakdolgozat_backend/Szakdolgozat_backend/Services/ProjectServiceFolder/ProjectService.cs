using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.ProjectServiceFolder
{
    public class ProjectService : IProjectService
    {

        private readonly DbCustomContext _db;
        private readonly IUserHelper _userHelper;
        private readonly IMapper _iMapper;
        private readonly IHttpContextAccessor _contextAccessor;

        public ProjectService(DbCustomContext db, IUserHelper userHelper, IMapper iMapper, IHttpContextAccessor contextAccessor)
        {
            _db = db;
            _userHelper = userHelper;
            _iMapper = iMapper;
            _contextAccessor = contextAccessor;
        }
        public async Task<List<ProjectResponseDTO>> GetAllProjects()
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            var userProjects = await _db.Projects
            .Where(project => _db.Participants.Any(participant => participant.ProjectId == project.Id && participant.UserId == userId))
            .Include(project => project.Participants)
            .Include(project => project.ProjectLists)
            .ToListAsync();

            List<ProjectResponseDTO> projectResponseDTOs = new();

            foreach (var project in userProjects)
            {
                var part = project.Participants.ToList();
                var partResp = new List<ParticipantResponseDTO>();

                foreach (var participant in part)
                {
                    var role = await _db.Roles.FindAsync(participant.RoleId);
                    var user = await _db.Users.FindAsync(participant.UserId);

                    string roleName = role!.Name;
                    string firstName = user!.FirstName;
                    string lastName = user!.LastName;

                    ParticipantResponseDTO participantResponseDTO = new()
                    {
                        Id = participant.Id,
                        FirstName = firstName,
                        LastName = lastName,
                        RoleName = roleName,
                        UserId = participant.UserId
                    };

                    partResp.Add(participantResponseDTO);
                }
                projectResponseDTOs.Add(new ProjectResponseDTO()
                {
                    Id = project.Id,
                    Created = project.Created,
                    Description = project.Description,
                    Title = project.Title,
                    Updated = project.Updated,
                    Participants = partResp
                });
            }

            return projectResponseDTOs;
        }
        public async Task<ProjectResponseDTO> GetProjectById(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? existingProject = await _db.Projects
                .Where(project => project.Id == projectId)
                .Include(project => project.Participants)
                .Include(project => project.ProjectLists)
                .FirstOrDefaultAsync();

            if (existingProject == null)
                throw new NotFoundException("Project not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, existingProject.Id))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            List<ParticipantResponseDTO> participantResponseDTO = new();

            foreach (var participant in existingProject.Participants)
            {
                User u = await _db.Users.Where(u => u.Id == participant.UserId).FirstAsync();
                Role r = await _db.Roles.Where(r => r.Id == participant.RoleId).FirstAsync();

                string firstName = u.FirstName;
                string lastName = u.LastName;
                string roleName = r.Name;

                ParticipantResponseDTO participantResponse = new()
                {
                    Id = participant.Id,
                    FirstName = firstName,
                    LastName = lastName,
                    RoleName = roleName,
                    UserId = participant.UserId
                };

                participantResponseDTO.Add(participantResponse);
            }

            ProjectResponseDTO projectResponseDTO = new()
            {
                Created = existingProject.Created,
                Updated = existingProject.Updated,
                Id = existingProject.Id,
                Description = existingProject.Description,
                Title = existingProject.Title,
                Participants = participantResponseDTO
            };

            return projectResponseDTO;
        }
        public async Task<ProjectCreatedDTO> AddProject(ProjectRequestDTO p)
        {
            Project newProject = new()
            {
                Created = DateTime.Now,
                Updated = DateTime.Now,
                Description = p.Description,
                Title = p.Title
            };

            await _db.Projects.AddAsync(newProject);
            await _db.SaveChangesAsync();

            var role = await _db.Roles.FirstAsync(i => i.Id == 1);
            var user = await _db.Users
                .FirstAsync(i => i.Id == _userHelper.GetAuthorizedUserGuid2(_contextAccessor));

            Participant participant = new()
            {
                Project = newProject,
                Role = role,
                User = user,
            };

            await _db.Participants.AddAsync(participant);
            await _db.SaveChangesAsync();

            return _iMapper.Map<ProjectCreatedDTO>(newProject);
        }
        public async Task AddUserToProject(string email, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? p = await _db.Projects.FindAsync(projectId);
            User? u = await _db.Users.FirstOrDefaultAsync(i => i.Email == email);
            Role? r = await _db.Roles.FindAsync(2);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (r == null)
                throw new NotFoundException("Role not found.");

            if (u == null)
                throw new NotFoundException("User not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");


            if (_userHelper.IsUserMemberOfProject(u.Id, projectId))
                throw new UserConflictException("User already added to project.");

            Participant participant = new()
            {
                Project = p,
                User = u,
                Role = r
            };

            await _db.Participants.AddAsync(participant);
            await _db.SaveChangesAsync();
        }
        public async Task DeleteProjectById(Guid projectId)
        {
            Project? existingProject = await _db.Projects.FirstOrDefaultAsync(project => project.Id == projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            if (existingProject == null)
                throw new NotFoundException("Project not found.");

            Participant? participant = await _db.Participants
                .Where(part => part.ProjectId == projectId && part.UserId == userId && part.RoleId == 1)
                .FirstOrDefaultAsync();

            if (participant == null)
                throw new Exceptions.UnauthorizedAccessException("User not member of project.");

            _db.Projects.Remove(existingProject);
            await _db.SaveChangesAsync();
        }
        public async Task RemoveUserFromProject(Guid existingUserId, Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            Project? p = await _db.Projects.FindAsync(projectId);
            User? u = await _db.Users.FindAsync(existingUserId);
            Role? r = await _db.Roles.FindAsync(2);

            if (p == null)
                throw new NotFoundException("Project not found.");

            if (r == null)
                throw new NotFoundException("Role not found.");

            if (u == null)
                throw new NotFoundException("User not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of this project.");

            if (!_userHelper.IsUserMemberOfProject(existingUserId, projectId))
                throw new Exceptions.UnauthorizedAccessException("User not member of this project.");

            Participant participant = await _db.Participants
                .Where(p => p.ProjectId == projectId && p.UserId == existingUserId)
                .FirstAsync();

            _db.Participants.Remove(participant);
            await _db.SaveChangesAsync();
        }
        public async Task<ProjectCreatedDTO> UpdateProjectById(Guid projectId, ProjectRequestDTO projectRequestDTO)
        {
            Project? existingProject = await _db.Projects.FirstOrDefaultAsync(i => i.Id == projectId);
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            if (existingProject == null)
                throw new NotFoundException("Project not found.");

            Participant? participant = await _db.Participants.Where(part => part.ProjectId == projectId
            && part.UserId == userId && part.RoleId == 1).FirstOrDefaultAsync();

            if (participant == null)
                throw new Exceptions.UnauthorizedAccessException("User not member of this project.");

            existingProject.Title = projectRequestDTO.Title;
            existingProject.Updated = DateTime.Now;
            existingProject.Description = projectRequestDTO.Description;

            _db.Projects.Update(existingProject);
            await _db.SaveChangesAsync();

            return _iMapper.Map<ProjectCreatedDTO>(existingProject);
        }
    }
}
