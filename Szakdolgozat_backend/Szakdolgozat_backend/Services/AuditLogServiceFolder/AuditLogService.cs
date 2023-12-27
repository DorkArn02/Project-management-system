﻿using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Szakdolgozat_backend.Dtos.AuditLogDtos;
using Szakdolgozat_backend.Exceptions;
using Szakdolgozat_backend.Helpers;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Services.AuditLogServiceFolder
{
    public class AuditLogService : IAuditLogService
    {
        private readonly DbCustomContext _db;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IUserHelper _userHelper;
        private readonly IMapper _mapper;

        public AuditLogService(DbCustomContext db, IHttpContextAccessor contextAccessor, IUserHelper userHelper, IMapper mapper)
        {
            _db = db;
            _contextAccessor = contextAccessor;
            _userHelper = userHelper;
            _mapper = mapper;
        }

        public async Task AddAuditLog(Guid projectId, string content)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");

            AuditLog auditLog = new()
            {
                Content = content,
                Project = p,
                User = user,
                Created = DateTime.Now,
            };

            await _db.AuditLogs.AddAsync(auditLog);

            await _db.SaveChangesAsync();
        }

        public async Task<List<AuditLogResponseDTO>> GetAuditLogs(Guid projectId)
        {
            Guid userId = _userHelper.GetAuthorizedUserGuid2(_contextAccessor);

            User? user = await _db.Users.FindAsync(userId);

            if (user == null)
                throw new NotFoundException($"User with id {userId} not found.");

            Project? p = await _db.Projects.FindAsync(projectId);

            if (p == null)
                throw new NotFoundException($"Project with id {projectId} not found.");

            if (!_userHelper.IsUserMemberOfProject(userId, projectId))
                throw new Exceptions.UnauthorizedAccessException($"User with id {userId} is not member of project.");

            List<AuditLog> auditLogs = await _db.AuditLogs.Where(x => x.ProjectId == projectId)
                .Include(u=>u.User).ToListAsync();

            return _mapper.Map<List<AuditLogResponseDTO>>(auditLogs).OrderByDescending(a=>a.Created).ToList();
        }
    }
}
