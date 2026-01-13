using System;
using System.ComponentModel.DataAnnotations;
using DuzeyYardimSistemi.Server.Models;

namespace DuzeyYardimSistemi.Server.Dtos
{
    public class TicketCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public TicketPriority Priority { get; set; }
        public TicketType Type { get; set; } = TicketType.Task;
        public int? StoryPoints { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        public int? SprintId { get; set; } // Null = Backlog
        public int? ParentId { get; set; }
        public string? AssigneeId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class TicketUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public TicketPriority? Priority { get; set; }
        public TicketType? Type { get; set; }
        public int? StoryPoints { get; set; }
        public int? StatusId { get; set; }
        public int? SprintId { get; set; } // 0 or -1 could mean "move to backlog"
        public int? ParentId { get; set; }
        public string? AssigneeId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class TicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TicketPriority Priority { get; set; }
        public TicketType Type { get; set; }
        public int? StoryPoints { get; set; }
        public string? Label { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectKey { get; set; } = string.Empty;

        public int? SprintId { get; set; }
        public string? SprintName { get; set; }
        public int? ParentId { get; set; }
        public string? ParentTitle { get; set; } // For Epic name
        public int? StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        
        public string? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }
        
        public string? ReporterId { get; set; }
        public string? ReporterName { get; set; }
    }

    public class TicketCommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
    }

    public class CreateTicketCommentDto
    {
        public string Content { get; set; }
    }
}
