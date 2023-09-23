using Szakdolgozat_backend.Dtos.ProjectDtos;

namespace Szakdolgozat_backend.Services.ProjectServiceFolder
{
    public interface IProjectService
    {
        Task<ProjectCreatedDTO> AddProject(ProjectRequestDTO p);
        Task<ProjectResponseDTO> GetProjectById(Guid projectId);
        Task<List<ProjectResponseDTO>> GetAllProjects();
        Task DeleteProjectById(Guid projectId);
        Task<ProjectCreatedDTO> UpdateProjectById(Guid projectId, ProjectRequestDTO projectRequestDTO);
        Task AddUserToProject(string email, Guid projectId);
        Task RemoveUserFromProject(Guid existingUserId, Guid projectId);
    }
}
