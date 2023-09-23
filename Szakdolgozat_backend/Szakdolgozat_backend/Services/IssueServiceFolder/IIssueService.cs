using Szakdolgozat_backend.Dtos;
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
        Task ChangePosition(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId);
        Task ChangePosition2(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId);
        Task ChangePosition3(Guid projectId, Guid sourceId, Guid destId, Guid sourceIssueId, Guid destIssueId);
    }
}
