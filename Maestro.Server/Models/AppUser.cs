using Microsoft.AspNetCore.Identity;
using System;

namespace DuzeyYardimSistemi.Server.Models
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // FullName helper
        public string FullName => $"{FirstName} {LastName}";
        
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
