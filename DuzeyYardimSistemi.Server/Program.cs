using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<AppUser, IdentityRole>(options => {
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// AUTH: JWT Setup
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = 
    options.DefaultChallengeScheme = 
    options.DefaultForbidScheme = 
    options.DefaultScheme = 
    options.DefaultSignInScheme = 
    options.DefaultSignOutScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"])
        )
    };
});

builder.Services.AddScoped<DuzeyYardimSistemi.Server.Services.ITokenService, DuzeyYardimSistemi.Server.Services.TokenService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapControllers();

// Seed Roles
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var roles = new[] { "Admin", "User", "Support" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Seed Users
    var usersToSeed = new[] {
        new { Email = "analist@duzey.com", First = "Ahmet", Last = "Analist" },
        new { Email = "dev1@duzey.com", First = "Mehmet", Last = "Developer" },
        new { Email = "dev2@duzey.com", First = "Ayse", Last = "Developer" }
    };

    foreach (var u in usersToSeed)
    {
        if (await userManager.FindByEmailAsync(u.Email) == null)
        {
            var user = new AppUser { UserName = u.Email, Email = u.Email, FirstName = u.First, LastName = u.Last };
            var result = await userManager.CreateAsync(user, "Password123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "User");
            }
        }
    }

    // Seed Project Members (Add everyone to first project)
    var firstProject = await dbContext.Projects.Include(p => p.Members).FirstOrDefaultAsync();
    if (firstProject != null)
    {
        var allUsers = await userManager.Users.ToListAsync();
        foreach (var user in allUsers)
        {
            if (!firstProject.Members.Any(ur => ur.Id == user.Id))
            {
                firstProject.Members.Add(user);
            }
        }
        await dbContext.SaveChangesAsync();
    }
}

app.Run();
