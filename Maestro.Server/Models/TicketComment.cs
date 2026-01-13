using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuzeyYardimSistemi.Server.Models
{
    public class TicketComment
    {
        public int Id { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }
        
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
    }
}
