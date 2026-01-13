using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuzeyYardimSistemi.Server.Models
{
    public class TicketHistory
    {
        public int Id { get; set; }
        
        public int TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }
        
        public string? UserId { get; set; } // Actor
        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
        
        public string Field { get; set; } = string.Empty; // e.g. "Status", "Assignee"
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }
}
