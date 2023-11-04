﻿using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Dtos.ProjectDtos
{
    public class ProjectResponseDTO
    {
        public Guid Id { get; set; } = Guid.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? IconName { get; set; } = string.Empty;
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public virtual ICollection<ParticipantResponseDTO> Participants { get; set; } = new List<ParticipantResponseDTO>();
    }
}
