using Microsoft.AspNetCore.Mvc;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.ProjectListServiceFolder
{
    public interface IProjectListService
    {
        Task<ProjectList> AddListToProject(Guid projectId, ProjectListRequestDTO listRequestDTO);
        Task<List<ProjectListResponseDTO>> GetAllListByProject(Guid projectId);
        Task<ProjectList> GetListByProject(Guid projectId, Guid projectListId);
        Task DeleteListFromProject(Guid projectId, Guid projectListId);
        Task<List<TaskResponseDTO>> GetPersonTasks();
        Task<List<TaskResponseDTO>> GetPersonTasksByProjectId(Guid projectId);
        Task<ProjectList> UpdateProjectList(Guid projectId, Guid projectLitID, string title);
        Task UpdateProjectListPosition(Guid projectId, Guid projectListId1, Guid projectListId2);
    }
}
