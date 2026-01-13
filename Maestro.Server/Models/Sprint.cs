using System.ComponentModel.DataAnnotations;

namespace DuzeyYardimSistemi.Server.Models
{
    public class Sprint
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        
        public List<Ticket> Tickets { get; set; } = new();
    }
}
