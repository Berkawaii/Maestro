using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,SupportAdmin")]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleController(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<string>>> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Role name is required");

            if (await _roleManager.RoleExistsAsync(dto.Name))
                return BadRequest("Role already exists");

            var result = await _roleManager.CreateAsync(new IdentityRole(dto.Name));
            if (result.Succeeded) return Ok(new { Message = "Role created" });

            return BadRequest(result.Errors);
        }

        [HttpDelete("{name}")]
        public async Task<IActionResult> DeleteRole(string name)
        {
            var role = await _roleManager.FindByNameAsync(name);
            if (role == null) return NotFound("Role not found");

            // Prevent deleting critical roles
            if (name == "Admin" || name == "User" || name == "Support" || name == "SupportAdmin")
                return BadRequest("Cannot delete system roles");

            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded) return NoContent();

            return BadRequest(result.Errors);
        }
    }

    public class RoleDto
    {
        public string Name { get; set; }
    }
}
