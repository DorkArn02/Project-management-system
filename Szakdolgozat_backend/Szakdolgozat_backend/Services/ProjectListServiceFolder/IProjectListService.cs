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
    }
}
