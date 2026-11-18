using Microsoft.EntityFrameworkCore;
using SPC.API.Models;

namespace SPC.API.Data
{
    // Creates the schema (if missing) and inserts demo data the first time the app starts.
    public static class DbSeeder
    {
        public static async Task InitAsync(ApplicationDbContext db, ILogger logger)
        {
            await db.Database.EnsureCreatedAsync();

            if (await db.Users.AnyAsync())
                return;

            logger.LogInformation("Seeding demo data...");
            string Hash(string p) => BCrypt.Net.BCrypt.HashPassword(p);

            var admin     = new User { FullName = "Demo Admin",     Email = "admin@spc.lk",     PasswordHash = Hash("Admin@123"),     Role = "admin",     IsApproved = true };
            var plant     = new User { FullName = "Demo Plant",     Email = "plant@spc.lk",     PasswordHash = Hash("Plant@123"),     Role = "plant",     IsApproved = true };
            var warehouse = new User { FullName = "Demo Warehouse", Email = "warehouse@spc.lk", PasswordHash = Hash("Warehouse@123"), Role = "warehouse", IsApproved = true };
            var pharmacy  = new User { FullName = "Demo Pharmacy",  Email = "pharmacy@spc.lk",  PasswordHash = Hash("Pharmacy@123"),  Role = "pharmacy",  IsApproved = true };
            var supplier  = new User { FullName = "Demo Supplier",  Email = "supplier@spc.lk",  PasswordHash = Hash("Supplier@123"),  Role = "supplier",  IsApproved = true };
            var pending   = new User { FullName = "Pending Supplier", Email = "pending@spc.lk", PasswordHash = Hash("Pending@123"),   Role = "supplier",  IsApproved = false };
            db.Users.AddRange(admin, plant, warehouse, pharmacy, supplier, pending);
            await db.SaveChangesAsync();

            var sup = new Supplier { CompanyName = "MediSupply Pvt Ltd", Address = "12 Galle Road, Colombo", Phone = "0112345678", UserId = supplier.Id };
            var sup2 = new Supplier { CompanyName = "NewPharma Traders", Address = "5 Kandy Road, Kelaniya", Phone = "0771234567", UserId = pending.Id };
            db.Suppliers.AddRange(sup, sup2);

            var now = DateTime.UtcNow;
            var drugs = new[]
            {
                new Drug { Name = "Paracetamol 500mg", Description = "Pain and fever relief", Manufacturer = "SPC Plant", ExpiryDate = now.AddYears(2), TotalQuantity = 5000 },
                new Drug { Name = "Amoxicillin 250mg", Description = "Antibiotic capsules",   Manufacturer = "SPC Plant", ExpiryDate = now.AddYears(1), TotalQuantity = 1200 },
                new Drug { Name = "Metformin 500mg",   Description = "Type 2 diabetes",       Manufacturer = "Hemas",     ExpiryDate = now.AddYears(3), TotalQuantity = 800  },
                new Drug { Name = "Salbutamol Inhaler", Description = "Asthma relief",        Manufacturer = "Cipla",     ExpiryDate = now.AddMonths(18), TotalQuantity = 300 },
            };
            db.Drugs.AddRange(drugs);
            await db.SaveChangesAsync();

            db.StockEntries.AddRange(
                new StockEntry { DrugId = drugs[0].Id, Quantity = 5000, SourceType = "internal", AddedAt = now.AddDays(-10), AddedBy = plant.Email },
                new StockEntry { DrugId = drugs[1].Id, Quantity = 1200, SourceType = "internal", AddedAt = now.AddDays(-8),  AddedBy = plant.Email },
                new StockEntry { DrugId = drugs[2].Id, Quantity = 800,  SourceType = "external", AddedAt = now.AddDays(-5), AddedBy = warehouse.Email },
                new StockEntry { DrugId = drugs[3].Id, Quantity = 300,  SourceType = "external", AddedAt = now.AddDays(-3), AddedBy = warehouse.Email });

            db.Orders.AddRange(
                new Order { DrugId = drugs[0].Id, UserId = pharmacy.Id, Quantity = 200, OrderedAt = now.AddDays(-2), Status = "Pending" },
                new Order { DrugId = drugs[2].Id, UserId = pharmacy.Id, Quantity = 50,  OrderedAt = now.AddDays(-6), Status = "Delivered", DeliveredAt = now.AddDays(-4) });

            var t1 = new Tender { Title = "Supply of Antibiotics 2026", Description = "Annual supply of oral antibiotics for state hospitals.", PublishDate = now.AddDays(-7), ClosingDate = now.AddDays(21), IsOpen = true };
            var t2 = new Tender { Title = "Diabetes Medication Q1", Description = "Quarterly supply of metformin and related drugs.", PublishDate = now.AddDays(-3), ClosingDate = now.AddDays(30), IsOpen = true };
            db.Tenders.AddRange(t1, t2);
            await db.SaveChangesAsync();

            db.TenderProposals.Add(new TenderProposal { TenderId = t1.Id, SupplierId = sup.Id, QuotedPrice = 1250000m, ProposalDocumentUrl = "https://example.com/proposal.pdf", SubmittedAt = now.AddDays(-1), Status = "Pending" });
            await db.SaveChangesAsync();
        }
    }
}
