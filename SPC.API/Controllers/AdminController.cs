using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPC.API.Data;
using SPC.API.DTOs;
using SPC.API.Models;

namespace SPC.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,plant,warehouse")] // Access restricted to admin, plant, and warehouse roles
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------------ SUPPLIER APPROVAL ------------------------

        // Get all pending supplier registration requests (only accessible to admin)
        [HttpGet("suppliers/pending")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetPendingSuppliers()
        {
            var suppliers = await _context.Users
                .Where(u => u.Role == "supplier" && !u.IsApproved)
                .Include(u => u.Supplier)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Supplier!.CompanyName,
                    u.Supplier.Address,
                    u.Supplier.Phone
                })
                .ToListAsync();

            return Ok(suppliers);
        }

        // Approve a supplier registration request
        [HttpPut("suppliers/{userId}/approve")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ApproveSupplier(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "supplier") return NotFound("Supplier not found.");

            user.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Supplier approved successfully." });
        }

        // Reject a supplier registration request
        [HttpPut("suppliers/{userId}/reject")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> RejectSupplier(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "supplier") return NotFound("Supplier not found.");

            user.IsApproved = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Supplier rejected successfully." });
        }

        // ------------------------ TENDERS & PROPOSALS ------------------------

        // Get a list of all tenders
        [HttpGet("tenders")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllTenders()
        {
            var tenders = await _context.Tenders
                .Select(t => new { t.Id, t.Title, t.Description, t.IsOpen })
                .ToListAsync();

            return Ok(tenders);
        }

        // Update a tender's open/close status
        [HttpPut("tenders/{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateTenderStatus(int id, [FromBody] bool isOpen)
        {
            var tender = await _context.Tenders.FindAsync(id);
            if (tender == null)
                return NotFound("Tender not found.");

            tender.IsOpen = isOpen;
            await _context.SaveChangesAsync();

            var status = isOpen ? "opened" : "closed";
            return Ok(new { message = $"Tender successfully {status}." });
        }

        // Get all proposals submitted for a specific tender
        [HttpGet("tenders/{tenderId}/proposals")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetTenderProposals(int tenderId)
        {
            var proposals = await _context.TenderProposals
                .Where(p => p.TenderId == tenderId)
                .Include(p => p.Supplier)
                .Select(p => new
                {
                    p.Id,
                    p.QuotedPrice,
                    p.SubmittedAt,
                    p.Status,
                    p.ProposalDocumentUrl,
                    Supplier = p.Supplier.CompanyName
                })
                .ToListAsync();

            return Ok(proposals);
        }

        // Approve a specific tender proposal and automatically close the tender
        [HttpPut("proposals/{proposalId}/approve")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ApproveTenderProposal(int proposalId)
        {
            var proposal = await _context.TenderProposals
                .Include(p => p.Tender)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == proposalId);

            if (proposal == null) return NotFound("Proposal not found.");
            if (!proposal.Tender.IsOpen) return BadRequest("Tender already closed.");

            proposal.Status = "Approved";
            proposal.Tender.IsOpen = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Proposal approved and tender closed." });
        }

        // ------------------------ PHARMACY ORDERS ------------------------

        // Get all pharmacy orders placed in the system
        [HttpGet("pharmacy-orders")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllPharmacyOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Drug)
                .Include(o => o.User)
                .Where(o => o.User.Role == "pharmacy")
                .Select(o => new
                {
                    o.Id,
                    Drug = o.Drug.Name,
                    o.Quantity,
                    o.Status,
                    o.OrderedAt,
                    PharmacyUser = o.User.Email
                })
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------ ORDER FULFILLMENT ------------------------

        // Get all pending orders that need to be delivered
        [HttpGet("orders/pending")]
        [Authorize(Roles = "admin,warehouse")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == "Pending")
                .Include(o => o.Drug)
                .Include(o => o.User)
                .Select(o => new
                {
                    o.Id,
                    Drug = o.Drug.Name,
                    Pharmacy = o.User.Email,
                    o.Quantity,
                    o.Status,
                    o.OrderedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        // Mark an order as delivered and record the delivery time
        [HttpPut("orders/{id}")]
        [Authorize(Roles = "admin,warehouse")]
        public async Task<IActionResult> MarkOrderDelivered(int id, [FromBody] OrderUpdateDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound("Order not found.");
            if (order.Status == "Delivered") return BadRequest("Order already delivered.");

            order.Status = dto.Status;
            order.DeliveredAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order marked as delivered." });
        }

        // ------------------------ DASHBOARD STATS ------------------------

        // Return summary statistics for admin dashboard
        [HttpGet("dashboard/stats")]
        [Authorize(Roles = "admin")]
        public IActionResult GetDashboardStats()
        {
            var totalSuppliers = _context.Users.Count(u => u.Role == "supplier" && u.IsApproved);
            var totalProposals = _context.TenderProposals.Count();
            var totalOrders = _context.Orders.Count();

            var approvedProposals = _context.TenderProposals.Count(p => p.Status.ToLower() == "approved");
            var pendingProposals = _context.TenderProposals.Count(p => p.Status.ToLower() == "pending");
            var rejectedProposals = _context.TenderProposals.Count(p => p.Status.ToLower() == "rejected");

            return Ok(new
            {
                totalSuppliers,
                totalProposals,
                totalOrders,
                approvedProposals,
                pendingProposals,
                rejectedProposals
            });
        }

        // ------------------------ PLANT STOCK MANAGEMENT ------------------------

        // Add produced stock (internal) from the plant
        [HttpPost("plant/stock")]
        [Authorize(Roles = "plant,admin")]
        public async Task<IActionResult> AddProducedStock([FromBody] AddStockDto dto)
        {
            var drug = await _context.Drugs.FindAsync(dto.DrugId);
            if (drug == null) return NotFound("Drug not found.");

            var username = User.Identity?.Name ?? "Unknown";

            var entry = new StockEntry
            {
                DrugId = dto.DrugId,
                Quantity = dto.Quantity,
                SourceType = "internal",
                AddedBy = username,
                AddedAt = DateTime.UtcNow
            };

            drug.TotalQuantity += dto.Quantity;

            _context.StockEntries.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Produced stock added successfully." });
        }

        // View all current plant stock
        [HttpGet("plant/stock")]
        [Authorize(Roles = "plant,admin")]
        public async Task<IActionResult> ViewPlantStock()
        {
            var drugs = await _context.Drugs.ToListAsync();
            return Ok(drugs);
        }

        // View history of stock entries from the plant
        [HttpGet("plant/stock/history")]
        [Authorize(Roles = "plant,admin")]
        public async Task<IActionResult> GetPlantStockHistory()
        {
            var history = await _context.StockEntries
                .Include(se => se.Drug)
                .Where(se => se.SourceType == "internal")
                .OrderByDescending(se => se.Id)
                .ToListAsync();

            return Ok(history);
        }

        // ------------------------ WAREHOUSE STOCK MANAGEMENT ------------------------

        // Add new stock to warehouse from any source
        [HttpPost("warehouse/stock/add")]
        [Authorize(Roles = "warehouse,admin")]
        public async Task<IActionResult> AddWarehouseStock([FromBody] AddStockDto dto)
        {
            var drug = await _context.Drugs.FindAsync(dto.DrugId);
            if (drug == null) return NotFound("Drug not found.");

            var username = User.Identity?.Name ?? "Unknown";

            var entry = new StockEntry
            {
                DrugId = dto.DrugId,
                Quantity = dto.Quantity,
                SourceType = dto.SourceType,
                AddedBy = username,
                AddedAt = DateTime.UtcNow
            };

            drug.TotalQuantity += dto.Quantity;

            _context.StockEntries.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Warehouse stock added successfully." });
        }

        // View current stock at the warehouse
        [HttpGet("warehouse/stock")]
        [Authorize(Roles = "warehouse,admin")]
        public async Task<IActionResult> GetAllWarehouseStock()
        {
            var drugs = await _context.Drugs.ToListAsync();
            return Ok(drugs);
        }

        // Update stock quantity of a drug in the warehouse
        [HttpPut("warehouse/stock/{id}")]
        [Authorize(Roles = "warehouse,admin")]
        public async Task<IActionResult> UpdateWarehouseStock(int id, [FromBody] int newQuantity)
        {
            var drug = await _context.Drugs.FindAsync(id);
            if (drug == null) return NotFound("Drug not found.");

            drug.TotalQuantity = newQuantity;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock quantity updated." });
        }

        // View history of warehouse stock entries
        [HttpGet("warehouse/stock/history")]
        [Authorize(Roles = "warehouse,admin")]
        public async Task<IActionResult> GetWarehouseStockHistory()
        {
            var history = await _context.StockEntries
                .Include(se => se.Drug)
                .OrderByDescending(se => se.Id)
                .ToListAsync();

            return Ok(history);
        }
    }
}
