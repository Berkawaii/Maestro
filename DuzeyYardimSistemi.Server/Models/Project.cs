using System;
using System.Collections.Generic;

namespace DuzeyYardimSistemi.Server.Models
{
    public enum ProjectType
    {
        Agile,
        HelpDesk
    }

    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty; // e.g. "PRJ"
        public string? Description { get; set; }
        public ProjectType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        // Navigation
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<TicketStatus> WebStatuses { get; set; } = new List<TicketStatus>();
        
        // Members
        public ICollection<AppUser> Members { get; set; } = new List<AppUser>();
    }
}
