using System.ComponentModel.DataAnnotations;

namespace DuzeyYardimSistemi.Server.Models
{
    public class Department
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty; // e.g. "SAP SD", "Hardware"
        
        public string? Description { get; set; }
    }
}
