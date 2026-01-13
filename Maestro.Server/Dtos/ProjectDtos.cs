using System.ComponentModel.DataAnnotations;
using DuzeyYardimSistemi.Server.Models;

namespace DuzeyYardimSistemi.Server.Dtos
{
    public class ProjectCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(5, MinimumLength = 2)]
        public string Key { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public ProjectType Type { get; set; } // 0 = Agile, 1 = HelpDesk
    }

    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ProjectType Type { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
