using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.OpenApi.Models;

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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Maestro API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{

    app.UseSwagger();
    app.UseSwaggerUI();
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

    var roles = new[] { "Admin", "User", "Support", "SupportAdmin", "Requester" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // 1. Seed Admin
    var adminEmail = "admin@duzey.com";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new AppUser { UserName = adminEmail, Email = adminEmail, FirstName = "System", LastName = "Admin", EmailConfirmed = true };
        var result = await userManager.CreateAsync(admin, "Password123!");
        if (result.Succeeded) await userManager.AddToRoleAsync(admin, "Admin");
    }
    else
    {
        // Ensure existing admin has Admin role
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }

    // 2. Seed Support Admin
    var supportAdminEmail = "supportadmin@duzey.com";
    if (await userManager.FindByEmailAsync(supportAdminEmail) == null)
    {
        var sa = new AppUser { UserName = supportAdminEmail, Email = supportAdminEmail, FirstName = "Support", LastName = "Lead", EmailConfirmed = true };
        var result = await userManager.CreateAsync(sa, "Password123!");
        if (result.Succeeded) await userManager.AddToRoleAsync(sa, "SupportAdmin");
    }

    // 3. Seed Support Users with Departments
    var supportUsers = new[] {
        new { Email = "sapsd@duzey.com", First = "Ali", Last = "SD", Dept = "SAP SD" },
        new { Email = "sapfi@duzey.com", First = "Veli", Last = "FI", Dept = "SAP FI" },
        new { Email = "sapewm@duzey.com", First = "Ayse", Last = "EWM", Dept = "SAP EWM" },
        new { Email = "hardware@duzey.com", First = "Can", Last = "Donanim", Dept = "Hardware" },
        new { Email = "network@duzey.com", First = "Mert", Last = "Ag", Dept = "Network" }
    };

    // Seed Departments
    var departments = new[] { "SAP SD", "SAP FI", "SAP EWM", "Hardware", "Network", "Support", "Other" };
    foreach (var d in departments)
    {
        if (!await dbContext.Departments.AnyAsync(x => x.Name == d))
        {
            dbContext.Departments.Add(new Department { Name = d });
        }
    }
    await dbContext.SaveChangesAsync();

    foreach (var u in supportUsers)
    {
        if (await userManager.FindByEmailAsync(u.Email) == null)
        {
            var user = new AppUser { UserName = u.Email, Email = u.Email, FirstName = u.First, LastName = u.Last, Department = u.Dept, EmailConfirmed = true };
            var result = await userManager.CreateAsync(user, "Password123!");
            if (result.Succeeded) await userManager.AddToRoleAsync(user, "Support");
        }
    }

    // 4. Seed Standard Users (Ticket Openers)
    var standardUsers = new[] {
        new { Email = "user1@duzey.com", First = "Zeynep", Last = "User" },
        new { Email = "user2@duzey.com", First = "Burak", Last = "User" },
        new { Email = "user3@duzey.com", First = "Selin", Last = "User" }
    };

    foreach (var u in standardUsers)
    {
        if (await userManager.FindByEmailAsync(u.Email) == null)
        {
            var user = new AppUser { UserName = u.Email, Email = u.Email, FirstName = u.First, LastName = u.Last, EmailConfirmed = true };
            var result = await userManager.CreateAsync(user, "Password123!");
            if (result.Succeeded) await userManager.AddToRoleAsync(user, "User");
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
