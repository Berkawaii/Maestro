using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepartmentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            return await _context.Departments.ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<ActionResult<Department>> CreateDepartment(Department dep)
        {
            if (string.IsNullOrWhiteSpace(dep.Name)) return BadRequest("Name is required");

            if (await _context.Departments.AnyAsync(d => d.Name == dep.Name))
                return BadRequest("Department already exists");

            _context.Departments.Add(dep);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartments), new { id = dep.Id }, dep);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var dep = await _context.Departments.FindAsync(id);
            if (dep == null) return NotFound();

            _context.Departments.Remove(dep);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
