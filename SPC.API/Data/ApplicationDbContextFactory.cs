using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace SPC.API.Data
{
    // This factory is used by EF Core CLI tools during design-time operations like migrations
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        // Creates the ApplicationDbContext instance with manually loaded configuration
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Build configuration from appsettings.json
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) // Ensures correct path to appsettings.json
                .AddJsonFile("appsettings.json") // Load connection strings and other settings
                .Build();

            // Initialize DbContextOptions with SQL Server connection string
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString); // Use SQL Server as provider

            // Return a new ApplicationDbContext with the configured options
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
