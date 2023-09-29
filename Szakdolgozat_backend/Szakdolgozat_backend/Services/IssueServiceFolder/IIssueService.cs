using Microsoft.AspNetCore.JsonPatch;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.IssueServiceFolder
{
    public interface IIssueService
    {
        Task<Issue> AddIssueToProjectList(Guid projectId, Guid projectListId, IssueRequestDTO issueRequestDTO);
        Task DeleteIssueFromProjectList(Guid projectId, Guid projectListId, Guid issueId);
        Task<Issue> AddAssigneeToIssue(Guid projectId, Guid projectListId, Guid issueId, int assigneeId);
        Task RemoveAssigneeFromIssue(Guid projectId, Guid projectListId, Guid issueId, Guid assigneeId);
        Task<Issue> ChangeIssueReporter(Guid projectId, Guid projectListId, Guid issueId, Guid reporterId);
        Task ChangePositionInColumn(Guid projectId, Guid columnId, Dictionary<Guid, int> positions);
        Task ChangePositionBetweenColumns(Guid projectId, Guid sourceColumnId, Guid destColumnId, Guid issueId, Dictionary<Guid, int> sourcePositions, Dictionary<Guid, int> destPositions);
        Task<Issue> UpdateIssueDetails(Guid projectId, Guid projectListId, Guid issueId, JsonPatchDocument<Issue> s);
    }
}
