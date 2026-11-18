using Microsoft.EntityFrameworkCore;
using SPC.API.Models;

namespace SPC.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ------------------------ DATABASE TABLES (DbSets) ------------------------

        // User accounts (admin, supplier, pharmacy, etc.)
        public DbSet<User> Users { get; set; }

        // Supplier-specific details linked to User
        public DbSet<Supplier> Suppliers { get; set; }

        // Tender announcements
        public DbSet<Tender> Tenders { get; set; }

        // Proposals submitted by suppliers for tenders
        public DbSet<TenderProposal> TenderProposals { get; set; }

        // Drug information used in pharmacy and warehouse
        public DbSet<Drug> Drugs { get; set; }

        // Stock entries (plant/warehouse additions)
        public DbSet<StockEntry> StockEntries { get; set; }

        // Orders placed by pharmacies
        public DbSet<Order> Orders { get; set; }

        // ------------------------ RELATIONSHIP CONFIGURATION ------------------------

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define one-to-one relationship:
            // A Supplier is associated with exactly one User
            modelBuilder.Entity<Supplier>()
                .HasOne(s => s.User)
                .WithOne(u => u.Supplier)
                .HasForeignKey<Supplier>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Deleting user deletes related supplier
        }
    }
}
