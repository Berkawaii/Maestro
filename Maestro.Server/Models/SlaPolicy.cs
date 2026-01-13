using System.ComponentModel.DataAnnotations;
using DuzeyYardimSistemi.Server.Models;

namespace DuzeyYardimSistemi.Server.Models
{
    public class SlaPolicy
    {
        public int Id { get; set; }
        public TicketPriority Priority { get; set; }
        public int MaxResolutionTimeMinutes { get; set; } // e.g. 60 for High, 240 for Medium
    }
}
