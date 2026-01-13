using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using DuzeyYardimSistemi.Server.Dtos;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
        {
            var projects = await _context.Projects
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Key = p.Key,
                    Description = p.Description,
                    Type = p.Type,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var p = await _context.Projects.FindAsync(id);

            if (p == null) return NotFound();

            return new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Key = p.Key,
                Description = p.Description,
                Type = p.Type,
                CreatedAt = p.CreatedAt
            };
        }

        [HttpPost]
        public async Task<ActionResult<ProjectDto>> CreateProject(ProjectCreateDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Key = dto.Key.ToUpper(),
                Description = dto.Description,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow
            };

            // If Type is HelpDesk, maybe add default statuses?
            if (project.Type == ProjectType.HelpDesk)
            {
                project.WebStatuses = new List<TicketStatus>
                {
                    new TicketStatus { Name = "New", Order = 1, IsInitial = true },
                    new TicketStatus { Name = "In Progress", Order = 2 },
                    new TicketStatus { Name = "Resolved", Order = 3 },
                    new TicketStatus { Name = "Closed", Order = 4, IsFinal = true }
                };
            }
            // If Agile
            else if (project.Type == ProjectType.Agile)
            {
                project.WebStatuses = new List<TicketStatus>
                {
                     new TicketStatus { Name = "To Do", Order = 1, IsInitial = true },
                     new TicketStatus { Name = "In Progress", Order = 2 },
                     new TicketStatus { Name = "Done", Order = 3, IsFinal = true }
                };
            }

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Key = project.Key,
                Description = project.Description,
                Type = project.Type,
                CreatedAt = project.CreatedAt
            });
        }
        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetProjectMembers(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound();

            var members = project.Members.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Roles = new List<string> { "User" } // Simplified for now
            }).ToList();

            return Ok(members);
        }
    }
}
