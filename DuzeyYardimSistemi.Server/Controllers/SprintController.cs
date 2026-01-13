using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Dtos;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SprintController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SprintController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SprintDto>>> GetSprints([FromQuery] int projectId)
        {
            var sprints = await _context.Sprints
                .Where(s => s.ProjectId == projectId)
                .Include(s => s.Tickets)
                .OrderBy(s => s.StartDate) // Or custom order
                .Select(s => new SprintDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Goal = s.Goal,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive,
                    IsCompleted = s.IsCompleted,
                    ProjectId = s.ProjectId
                    // Tickets fetching could be heavy, maybe separate call or selective
                })
                .ToListAsync();

            return Ok(sprints);
        }

        [HttpPost]
        public async Task<ActionResult<SprintDto>> CreateSprint(SprintCreateDto dto)
        {
            var sprint = new Sprint
            {
                Name = dto.Name,
                Goal = dto.Goal,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ProjectId = dto.ProjectId,
                IsActive = false,
                IsCompleted = false
            };
            
            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSprints), new { projectId = sprint.ProjectId }, new SprintDto 
            { 
                Id = sprint.Id,
                Name = sprint.Name,
                ProjectId = sprint.ProjectId
            });
        }
        
        [HttpPut("{id}/start")]
        public async Task<IActionResult> StartSprint(int id, [FromBody] SprintUpdateDto dto)
        {
            var sprint = await _context.Sprints.FindAsync(id);
            if (sprint == null) return NotFound();
            
            // Check if any other sprint is active in this project
            var activeSprintExists = await _context.Sprints
                .AnyAsync(s => s.ProjectId == sprint.ProjectId && s.IsActive && s.Id != id);
            
            if (activeSprintExists)
            {
                return BadRequest("There is already an active sprint in this project. Please complete it first.");
            }
            
            sprint.IsActive = true;
            sprint.StartDate = dto.StartDate ?? DateTime.UtcNow;
            sprint.EndDate = dto.EndDate ?? DateTime.UtcNow.AddDays(14);
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSprint(int id, [FromBody] SprintUpdateDto dto)
        {
            var sprint = await _context.Sprints.FindAsync(id);
            if (sprint == null) return NotFound();

            if (!string.IsNullOrEmpty(dto.Name)) sprint.Name = dto.Name;
            if (dto.Goal != null) sprint.Goal = dto.Goal;
            if (dto.StartDate.HasValue) sprint.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) sprint.EndDate = dto.EndDate;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteSprint(int id)
        {
            var sprint = await _context.Sprints
                .Include(s => s.Tickets)
                .ThenInclude(t => t.Status)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sprint == null) return NotFound();
            
            // Find "Final" stats (e.g. Done)
            // We assume a status is final if IsFinal is true.
            var finalStatuses = await _context.TicketStatuses
                .Where(s => s.ProjectId == sprint.ProjectId && s.IsFinal)
                .Select(s => s.Id)
                .ToListAsync();

            // Move incomplete tickets to Backlog
            foreach (var ticket in sprint.Tickets)
            {
                if (!ticket.StatusId.HasValue || !finalStatuses.Contains(ticket.StatusId.Value))
                {
                    ticket.SprintId = null; // Move to Backlog
                    // Optional: Reset status to To Do? Usually kept as is but in backlog.
                }
            }
            
            sprint.IsActive = false;
            sprint.IsCompleted = true;
            sprint.EndDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
