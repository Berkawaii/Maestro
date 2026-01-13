using System.Security.Claims;
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
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(int id)
        {
            var t = await _context.Tickets
                .Include(t => t.Project)
                .Include(t => t.Status)
                .Include(t => t.Assignee)
                .Include(t => t.Reporter)
                .Include(t => t.Sprint)
                .Include(t => t.Parent)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (t == null) return NotFound();

            return new TicketDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Type = t.Type,
                StoryPoints = t.StoryPoints,
                Label = t.Label,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                ProjectId = t.ProjectId,
                ProjectName = t.Project!.Name,
                ProjectKey = t.Project.Key,
                SprintId = t.SprintId,
                SprintName = t.Sprint != null ? t.Sprint.Name : null,
                StatusId = t.StatusId,
                StatusName = t.Status != null ? t.Status.Name : "Unknown",
                AssigneeId = t.AssigneeId,
                AssigneeName = t.Assignee != null ? t.Assignee.FullName : null,
                ReporterId = t.ReporterId,
                ReporterName = t.Reporter != null ? t.Reporter.FullName : null,
                ParentId = t.ParentId,
                ParentTitle = t.Parent != null ? t.Parent.Title : null
            };
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] int? projectId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(userId);
            var isAdmin = User.IsInRole("Admin") || User.IsInRole("SupportAdmin");
            var isSupport = User.IsInRole("Support");
            var isRequester = User.IsInRole("Requester");

            // Base query
            var query = _context.Tickets
                .Include(t => t.Project)
                    .ThenInclude(p => p.Members) // Include members to check access
                .Include(t => t.Status)
                .Include(t => t.Assignee)
                .Include(t => t.Reporter)
                .Include(t => t.Sprint)
                .Include(t => t.Parent)
                .AsQueryable();

            if (projectId.HasValue)
            {
                // PROJECT CONTEXT
                query = query.Where(t => t.ProjectId == projectId.Value);

                // Access Control for Project
                if (!isAdmin)
                {
                   // If in project context, check if user is member
                   // Note: This logic assumes if you query a project, you want to see all tickets if you are a member
                   // However, for Requester, they might not be allowed to see others' tickets even in a project?
                   
                   if (isRequester) 
                   {
                        // Requesters only see their own tickets, even in a project (if they ever access one)
                        query = query.Where(t => t.ReporterId == userId);
                   }
                   else 
                   {
                        // "User" or "Support"
                        // Rule: "plain users should see all issues in projects they are added to"
                        // We need to verify membership. 
                        // Since we can't easily filter by "Parent Project Members contains Me" in a simple where clause without join,
                        // we'll check membership first or use a subquery.
                        
                        // Optimized: Check membership logic.
                        // Assuming the user submitting the request is the one logged in.
                        // If the user is a member of the project, they see ALL tickets (no reporter filter).
                        // If NOT a member, they see nothing (or forbid).
                        
                        // For a clean query, let's filter:
                        query = query.Where(t => t.Project.Members.Any(m => m.Id == userId));
                   }
                }
            }
            else
            {
                // GLOBAL CONTEXT (Dashboard / My Tickets)
                // Filter out Project management issues (Stories, Epics) for the global help desk view
                query = query.Where(t => t.Type != TicketType.Story && t.Type != TicketType.Epic);

                if (isAdmin)
                {
                    // Sees everything
                }
                else if (isSupport)
                {
                    if (!string.IsNullOrEmpty(user?.Department))
                    {
                        query = query.Where(t => t.Category == user.Department || t.ReporterId == userId || t.AssigneeId == userId);
                    }
                    else
                    {
                        query = query.Where(t => t.ReporterId == userId || t.AssigneeId == userId);
                    }
                }
                else if (isRequester)
                {
                     // Requester sees ONLY own tickets
                     query = query.Where(t => t.ReporterId == userId);
                }
                else // Standard User
                {
                    // Standard User in Global View: Sees own tickets + Assigned tickets
                    query = query.Where(t => t.ReporterId == userId || t.AssigneeId == userId);
                }
            }

            var tickets = await query
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    Type = t.Type,
                    StoryPoints = t.StoryPoints,
                    Label = t.Label,
                    Category = t.Category,
                    CreatedAt = t.CreatedAt,
                    DueDate = t.DueDate,
                    ProjectId = t.ProjectId,
                    ProjectName = t.Project!.Name,
                    ProjectKey = t.Project.Key,
                    SprintId = t.SprintId,
                    SprintName = t.Sprint != null ? t.Sprint.Name : null,
                    StatusId = t.StatusId,
                    StatusName = t.Status != null ? t.Status.Name : "Unknown",
                    AssigneeId = t.AssigneeId,
                    AssigneeName = t.Assignee != null ? t.Assignee.FullName : null,
                    ReporterId = t.ReporterId,
                    ReporterName = t.Reporter != null ? t.Reporter.FullName : null,
                    ParentId = t.ParentId,
                    ParentTitle = t.Parent != null ? t.Parent.Title : null
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SupportAdmin")] // Only admins can delete
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(TicketCreateDto dto)
        {
            // Get current user id
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Find default status for project (Order = 1)
            var initialStatus = await _context.TicketStatuses
                .Where(s => s.ProjectId == dto.ProjectId && s.IsInitial)
                .FirstOrDefaultAsync();

            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Type = dto.Type,
                StoryPoints = dto.StoryPoints,
                ProjectId = dto.ProjectId,
                AssigneeId = string.IsNullOrEmpty(dto.AssigneeId) ? null : dto.AssigneeId,
                ReporterId = userId,
                StatusId = initialStatus?.Id, 
                SprintId = dto.SprintId,
                ParentId = dto.ParentId,
                Label = dto.Label,
                Category = dto.Category,
                CreatedAt = DateTime.UtcNow,
                DueDate = dto.DueDate
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Refetch to get related data names (optional, or just return basic)
            // For speed, let's just return mapped DTO manually or re-query
            return Ok(new { Message = "Ticket created", TicketId = ticket.Id });
        }
        [HttpPatch("{id}")] // Using Patch for partial updates
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] TicketUpdateDto dto)
        {
            var ticket = await _context.Tickets.Include(t => t.Assignee).Include(t => t.Status).FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // History Logging Helper
            async Task LogChange(string field, string? oldVal, string? newVal)
            {
                if (oldVal != newVal)
                {
                    _context.TicketHistories.Add(new TicketHistory
                    {
                        TicketId = id,
                        UserId = userId,
                        Field = field,
                        OldValue = oldVal,
                        NewValue = newVal,
                        ChangedAt = DateTime.UtcNow
                    });
                }
            }

            if (!string.IsNullOrEmpty(dto.Title)) 
            {
                await LogChange("Title", ticket.Title, dto.Title);
                ticket.Title = dto.Title;
            }
            if (dto.Description != null) 
            {
                await LogChange("Description", ticket.Description, dto.Description);
                ticket.Description = dto.Description;
            }
            if (dto.StatusId.HasValue && ticket.StatusId != dto.StatusId)
            {
                var oldStatus = ticket.Status?.Name ?? ticket.StatusId?.ToString();
                var newStatusObj = await _context.TicketStatuses.FindAsync(dto.StatusId);
                await LogChange("Status", oldStatus, newStatusObj?.Name ?? dto.StatusId.ToString());
                ticket.StatusId = dto.StatusId.Value;
            }
            if (dto.Priority.HasValue)
            {
                await LogChange("Priority", ticket.Priority.ToString(), dto.Priority.Value.ToString());
                 ticket.Priority = dto.Priority.Value;
            }
            if (dto.StoryPoints.HasValue)
            {
                await LogChange("StoryPoints", ticket.StoryPoints?.ToString(), dto.StoryPoints.Value.ToString());
                ticket.StoryPoints = dto.StoryPoints.Value;
            }
            
            // Assignee
            if (dto.AssigneeId != null)
            {
                var oldAssignee = ticket.Assignee?.FullName ?? "Unassigned";
                string? newAssigneeName = "Unassigned";
                if (!string.IsNullOrEmpty(dto.AssigneeId))
                {
                    var newAssignee = await _context.Users.FindAsync(dto.AssigneeId);
                    newAssigneeName = newAssignee?.FullName;
                }
                
                await LogChange("Assignee", oldAssignee, newAssigneeName);
                ticket.AssigneeId = string.IsNullOrEmpty(dto.AssigneeId) ? null : dto.AssigneeId;
            }

            if (dto.SprintId.HasValue) ticket.SprintId = dto.SprintId.Value == 0 ? null : dto.SprintId.Value;
            if (dto.DueDate.HasValue) ticket.DueDate = dto.DueDate.Value;
            if (dto.ParentId.HasValue) ticket.ParentId = dto.ParentId.Value == 0 ? null : dto.ParentId.Value;

            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/comments")]
        public async Task<ActionResult<IEnumerable<TicketCommentDto>>> GetComments(int id)
        {
            var comments = await _context.TicketComments
                .Where(c => c.TicketId == id)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new TicketCommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UserId = c.UserId,
                    UserName = c.User != null ? c.User.FullName : "Unknown"
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost("{id}/comments")]
        public async Task<ActionResult<TicketCommentDto>> AddComment(int id, [FromBody] CreateTicketCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                // Fallback for some JWT configurations
                userId = User.FindFirstValue("sub");
            }

            if (string.IsNullOrEmpty(userId)) return Unauthorized("User ID claim not found.");
            
            var comment = new TicketComment
            {
                TicketId = id,
                UserId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketComments.Add(comment);
            await _context.SaveChangesAsync();

            // Load user to return name
            await _context.Entry(comment).Reference(c => c.User).LoadAsync();

            return Ok(new TicketCommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UserId = comment.UserId,
                UserName = comment.User?.FullName ?? "Unknown"
            });
        }
        
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistory(int id)
        {
            var history = await _context.TicketHistories
                .Where(h => h.TicketId == id)
                .Include(h => h.User)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new 
                {
                    h.Id,
                    h.Field,
                    h.OldValue,
                    h.NewValue,
                    h.ChangedAt,
                    UserName = h.User != null ? h.User.FullName : "Unknown"
                })
                .ToListAsync();

            return Ok(history);
        }
    }
}
