using System;
using System.Collections.Generic;

namespace DuzeyYardimSistemi.Server.Dtos
{
    public class SprintDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public int ProjectId { get; set; }
        public List<TicketDto> Tickets { get; set; } = new();
    }

    public class SprintCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int ProjectId { get; set; }
    }

    public class SprintUpdateDto
    {
        public string? Name { get; set; }
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
