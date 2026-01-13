using System.Collections.Generic;

namespace DuzeyYardimSistemi.Server.Models
{
    public class TicketStatus
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsInitial { get; set; }
        public bool IsFinal { get; set; }
        
        // Link to project to have custom workflows per project
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
    }
}
