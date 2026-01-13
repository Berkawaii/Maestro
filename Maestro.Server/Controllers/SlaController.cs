using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,SupportAdmin")] // Only admins can manage SLA
    public class SlaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SlaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/sla/config
        [HttpGet("config")]
        public async Task<ActionResult<WorkingHourConfig>> GetConfig()
        {
            var config = await _context.WorkingHourConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new WorkingHourConfig();
                _context.WorkingHourConfigs.Add(config);
                await _context.SaveChangesAsync();
            }
            return Ok(config);
        }

        // POST: api/sla/config
        [HttpPost("config")]
        public async Task<IActionResult> UpdateConfig([FromBody] WorkingHourConfig dto)
        {
            var config = await _context.WorkingHourConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new WorkingHourConfig();
                _context.WorkingHourConfigs.Add(config);
            }

            config.StartTime = dto.StartTime;
            config.EndTime = dto.EndTime;
            config.WorkDays = dto.WorkDays;
            config.IsHolidayProcessingEnabled = dto.IsHolidayProcessingEnabled;

            await _context.SaveChangesAsync();
            return Ok(config);
        }

        // GET: api/sla/policies
        [HttpGet("policies")]
        public async Task<ActionResult<IEnumerable<SlaPolicy>>> GetPolicies()
        {
            return await _context.SlaPolicies.OrderBy(p => p.Priority).ToListAsync();
        }

        // PUT: api/sla/policies
        [HttpPut("policies")]
        public async Task<IActionResult> UpdatePolicies([FromBody] List<SlaPolicy> policies)
        {
            foreach (var p in policies)
            {
                var policy = await _context.SlaPolicies.FindAsync(p.Id);
                if (policy != null)
                {
                    policy.MaxResolutionTimeMinutes = p.MaxResolutionTimeMinutes;
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
        // GET: api/sla/report?type=daily|weekly|monthly
        [HttpGet("report")]
        public async Task<ActionResult<IEnumerable<object>>> GetReport([FromQuery] string type = "monthly")
        {
            var now = DateTime.UtcNow;
            DateTime startDate;

            switch (type.ToLower()) 
            {
                case "daily": startDate = now.Date; break; // Today
                case "weekly": startDate = now.Date.AddDays(-(int)now.DayOfWeek + 1); break; // This Week (start Monday)
                case "monthly": default: startDate = new DateTime(now.Year, now.Month, 1); break; // This Month
            }

            // Get Tickets for SUPPORT project created after startDate
            // Include:
            // 1. Resolved tickets (ResolvedAt != null)
            // 2. Active tickets that are Overdue (ResolvedAt == null && DueDate < now)
            var tickets = await _context.Tickets
                .Include(t => t.Project)
                .Where(t => t.Project.Key == "SUPPORT" && t.CreatedAt >= startDate && t.DueDate != null &&
                            (t.ResolvedAt != null || t.DueDate < now))
                .ToListAsync();

            // Check SLA status
            var data = tickets.Select(t => {
                bool isResolved = t.ResolvedAt != null;
                bool isMet = isResolved && t.ResolvedAt <= t.DueDate;
                // If not resolved, it's missed because we filtered for DueDate < now
                
                return new 
                {
                    Department = t.Category ?? "Uncategorized",
                    MetSla = isMet,
                    IsResolved = isResolved
                };
            });

            var report = data
                .GroupBy(t => t.Department)
                .Select(g => new 
                {
                    Department = g.Key,
                    TotalResolved = g.Count(x => x.IsResolved), // Only count resolved in specific total? Or all impacted? Let's show Total Impacted.
                    TotalImpacted = g.Count(),
                    MetSla = g.Count(x => x.MetSla),
                    MissedSla = g.Count(x => !x.MetSla), // Includes resolved-late and unresolved-overdue
                    ComplianceRate = g.Count() > 0 ? (double)g.Count(x => x.MetSla) / g.Count() * 100 : 0
                })
                .ToList();

            return Ok(report);
        }
    }
}
