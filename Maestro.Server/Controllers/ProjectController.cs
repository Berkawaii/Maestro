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
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SupportAdmin");

            IQueryable<Project> query = _context.Projects.Include(p => p.Members);

            if (!isAdmin)
            {
                // Users see only projects they are members of
                query = query.Where(p => p.Members.Any(u => u.Id == userId));
            }

            var projects = await query
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
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SupportAdmin");

            var p = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return NotFound();

            // Access Check
            if (!isAdmin && !p.Members.Any(u => u.Id == userId))
            {
                return Forbid();
            }

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
        [Authorize(Roles = "Admin,SupportAdmin")]
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

            // Automatically add the creator (if needed) or just admin?
            // Let's add all admins? No, keep it simple.
            
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetProjectMembers(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound();

            // Check access? Typically yes
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SupportAdmin");
             if (!isAdmin && !project.Members.Any(u => u.Id == userId)) return Forbid();

            var members = project.Members.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Roles = new List<string> { "User" } 
            }).ToList();

            return Ok(members);
        }

        [HttpPost("{id}/members")]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<IActionResult> AddMember(int id, [FromBody] ProjectMemberDto dto)
        {
            var project = await _context.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound("Project not found");

            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound("User not found");

            if (!project.Members.Any(u => u.Id == user.Id))
            {
                project.Members.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpDelete("{id}/members/{userId}")]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<IActionResult> RemoveMember(int id, string userId)
        {
            var project = await _context.Projects.Include(p => p.Members).FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound("Project not found");

            var user = project.Members.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User is not a member of this project");

            project.Members.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ProjectMemberDto
    {
        public string UserId { get; set; }
    }
}
