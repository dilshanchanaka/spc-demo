using SPC.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

// Lets Npgsql accept DateTime values of any Kind (frontend dates arrive as "Unspecified").
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Render/Railway etc. tell the app which port to listen on via PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// -------------------------------------------
// ✅ Step 1: Configure Entity Framework with SQL Server
// -------------------------------------------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

// PostgreSQL (hosted demo: Neon/Supabase) or SQL Server (local development).
// Postgres is chosen when the connection string looks like Postgres.
var usePostgres = connectionString.StartsWith("postgres", StringComparison.OrdinalIgnoreCase)
                  || connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (usePostgres)
        options.UseNpgsql(ToNpgsqlConnectionString(connectionString));
    else
        options.UseSqlServer(connectionString);
});

// Converts "postgresql://user:pass@host/db?sslmode=require" (the format Neon/Supabase show)
// into an Npgsql connection string. Normal "Host=...;" strings pass through unchanged.
static string ToNpgsqlConnectionString(string cs)
{
    if (!cs.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !cs.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        return cs;

    var uri = new Uri(cs);
    var userInfo = uri.UserInfo.Split(':', 2);
    return new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
        SslMode = Npgsql.SslMode.Require
    }.ConnectionString;
}

// -------------------------------------------
// ✅ Step 2: Configure JWT Authentication
// -------------------------------------------
var jwtKey = builder.Configuration["Jwt:Key"];
var key = Encoding.ASCII.GetBytes(jwtKey!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // For local dev only
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// -------------------------------------------
// ✅ Step 3: Add Swagger + JWT Auth Support
// -------------------------------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SPC API", Version = "v1" });

    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Description = "Enter 'Bearer' followed by your JWT token.",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

// -------------------------------------------
// ✅ Step 4: Configure CORS to allow React frontend
// -------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Comma-separated list in the Cors__AllowedOrigins setting, e.g. "https://spc-demo.vercel.app"
        var origins = (builder.Configuration["Cors:AllowedOrigins"] ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Concat(new[] { "http://localhost:5173" })
            .ToArray();

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// -------------------------------------------
// ✅ Step 5: Add MVC support
// -------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// -------------------------------------------
// ✅ Build and configure the app
// -------------------------------------------
var app = builder.Build();

// ✅ Enable Swagger in Development
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -------------------------------------------
// ✅ Configure HTTP Pipeline
// -------------------------------------------
// Hosting platforms terminate HTTPS before the container, so only redirect in development.
if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("AllowFrontend");          // ⬅️ Place CORS BEFORE auth
app.UseAuthentication();               // ⬅️ Enable authentication
app.UseAuthorization();                // ⬅️ Enable authorization

app.MapControllers();                  // ⬅️ Map API endpoints
app.MapGet("/", () => "SPC API is running.");
app.MapGet("/health", () => Results.Ok("ok"));

// ✅ Create tables + demo data on first start (only when SEED_DEMO_DATA is not "false")
if (!string.Equals(builder.Configuration["SEED_DEMO_DATA"], "false", StringComparison.OrdinalIgnoreCase)
    && usePostgres)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.InitAsync(db, app.Logger);
}

// ✅ Run the app
app.Run();
