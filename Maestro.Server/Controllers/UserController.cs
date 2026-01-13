using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Simple authorize first, specific methods check roles
    public class UserController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDbContext _context;

        public UserController(UserManager<AppUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // GET: api/User
        // Only Admins or SupportAdmins can list all users to manage them
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserListDto>();

            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                userDtos.Add(new UserListDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Department = u.Department,
                    Roles = roles.ToList()
                });
            }

            return Ok(userDtos);
        }

        public class UserListDto
        {
            public string Id { get; set; }
            public string? UserName { get; set; }
            public string? Email { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Department { get; set; }
            public List<string> Roles { get; set; } = new();
        }

        // PUT: api/User/{id}
        // Update Department or Roles
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,SupportAdmin")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (dto.Department != null) user.Department = dto.Department;
            if (dto.FirstName != null) user.FirstName = dto.FirstName;
            if (dto.LastName != null) user.LastName = dto.LastName;

            await _userManager.UpdateAsync(user);

            // Update Roles if provided
            if (dto.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRolesAsync(user, dto.Roles);
            }

            return NoContent();
        }

        public class UpdateUserDto
        {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Department { get; set; }
            public List<string>? Roles { get; set; }
        }
    }
}
