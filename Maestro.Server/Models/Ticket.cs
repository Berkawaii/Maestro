using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuzeyYardimSistemi.Server.Models
{
    public enum TicketPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum TicketType
    {
        Story,
        Task,
        Bug,
        Epic
    }

    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public TicketPriority Priority { get; set; }
        public TicketType Type { get; set; } = TicketType.Task;
        public int? StoryPoints { get; set; }
        public string? Label { get; set; } // e.g. "MIGRATION", "SIPARIS"
        public string? Category { get; set; } // e.g. "SAP SD", "Hardware", "Network"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; } // For SLA
        public DateTime? ResolvedAt { get; set; }

        // Foreign Keys
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        
        public int? SprintId { get; set; }
        public Sprint? Sprint { get; set; }

        public int? ParentId { get; set; }
        public Ticket? Parent { get; set; }
        public ICollection<Ticket> Children { get; set; } = new List<Ticket>();

        public int? StatusId { get; set; }
        public TicketStatus? Status { get; set; }

        public string? ReporterId { get; set; }
        [ForeignKey("ReporterId")]
        public AppUser? Reporter { get; set; }

        public string? AssigneeId { get; set; }
        [ForeignKey("AssigneeId")]
        public AppUser? Assignee { get; set; }
    }
}
