﻿using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.CommentDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Dtos.IssueDtos
{
    public class IssueResponseDTO
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime Created { get; set; }

        public DateTime Updated { get; set; }

        public DateTime? DueDate { get; set; }
        public Guid ProjectListId { get; set; }

        public int Position { get; set; }

        public int? TimeEstimate { get; set; }

        public int? TimeSpent { get; set; }

        public Guid? ParentIssueId { get; set; }

        public List<IssueResponseDTO>? ChildrenIssues { get; set; }

        public Guid ReporterId { get; set; } // Bejelentő azonosítója

        public string ReporterName { get; set; } = string.Empty;

        public Priority Priority { get; set; } = null!;

        public List<AssignedPersonDTO> AssignedPeople { get; set; } = new ();

        public List<CommentResponseDTO> Comments { get; set; } = new ();
        public IssueType IssueType { get; set; }

    }
}
