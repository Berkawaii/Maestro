using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class TicketStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketStatusController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketStatusDto>>> GetStatuses([FromQuery] int projectId)
        {
            var statuses = await _context.TicketStatuses
                .Where(s => s.ProjectId == projectId)
                .OrderBy(s => s.Order)
                .Select(s => new TicketStatusDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Order = s.Order,
                    IsInitial = s.IsInitial,
                    IsFinal = s.IsFinal,
                    ProjectId = s.ProjectId
                })
                .ToListAsync();

            return Ok(statuses);
        }

        [HttpPost]
        public async Task<ActionResult<TicketStatusDto>> CreateStatus(TicketStatusCreateDto dto)
        {
            // Simple logic: If IsInitial is set, unset others? Not implementing for MVP speed.
            
            var status = new TicketStatus
            {
                Name = dto.Name,
                Order = dto.Order,
                IsInitial = dto.IsInitial,
                IsFinal = dto.IsFinal,
                ProjectId = dto.ProjectId
            };

            _context.TicketStatuses.Add(status);
            await _context.SaveChangesAsync();

            return Ok(new TicketStatusDto
            {
                Id = status.Id,
                Name = status.Name,
                Order = status.Order,
                IsInitial = status.IsInitial,
                IsFinal = status.IsFinal,
                ProjectId = status.ProjectId
            });
        }
    }
}
