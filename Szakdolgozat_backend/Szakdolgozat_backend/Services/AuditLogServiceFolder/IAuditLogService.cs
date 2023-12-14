using Szakdolgozat_backend.Dtos.AuditLogDtos;

namespace Szakdolgozat_backend.Services.AuditLogServiceFolder
{
    public interface IAuditLogService
    {
        Task AddAuditLog(Guid projectId, string content);

        Task<List<AuditLogResponseDTO>> GetAuditLogs(Guid projectId);
    }
}
