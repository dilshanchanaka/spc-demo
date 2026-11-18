using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPC.API.Data;
using SPC.API.DTOs;
using SPC.API.Models;
using System.Security.Claims;

namespace SPC.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "supplier")] // Grants access only to users with 'supplier' role
    public class SupplierController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SupplierController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------------ 1. CHECK APPROVAL STATUS ------------------------

        // GET: /api/supplier/status
        // Returns approval status of the logged-in supplier
        [HttpGet("status")]
        public async Task<IActionResult> GetApprovalStatus()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found.");

            return Ok(new
            {
                isApproved = user.IsApproved,
                message = user.IsApproved
                    ? "Your account is approved."
                    : "Your account is still pending approval."
            });
        }

        // ------------------------ 2. CREATE TENDER ------------------------

        // POST: /api/supplier/create-tender
        // Allows an approved supplier to create a new tender (saved as closed by default)
        [HttpPost("create-tender")]
        public async Task<IActionResult> CreateTender([FromBody] TenderDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users
                .Include(u => u.Supplier)
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null || user.Supplier == null)
                return Unauthorized("You must be a registered supplier.");

            if (!user.IsApproved)
                return StatusCode(403, new { message = "Your account is not approved yet." });

            var tender = new Tender
            {
                Title = dto.Title,
                Description = dto.Description,
                ClosingDate = dto.ClosingDate,
                PublishDate = DateTime.UtcNow,
                IsOpen = false // Tender is initially closed until approved by admin
            };

            _context.Tenders.Add(tender);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tender created successfully.", tenderId = tender.Id });
        }

        // ------------------------ 3. GET OPEN TENDERS ------------------------

        // GET: /api/supplier/tenders
        // Returns a list of currently open and valid tenders for suppliers to view and apply
        [HttpGet("tenders")]
        public async Task<IActionResult> GetOpenTenders()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null)
                return Unauthorized("You must be a registered supplier.");

            if (!user.IsApproved)
                return StatusCode(403, new { message = "Your account is not approved yet." });

            var tenders = await _context.Tenders
                .Where(t => t.IsOpen && t.ClosingDate > DateTime.UtcNow)
                .ToListAsync();

            return Ok(tenders);
        }

        // ------------------------ 4. GET ALL TENDERS (INCL. CLOSED) ------------------------

        // GET: /api/supplier/all-tenders
        // Returns all tenders regardless of status (open/closed)
        [HttpGet("all-tenders")]
        public async Task<IActionResult> GetAllTenders()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null)
                return Unauthorized("You must be a registered supplier.");

            if (!user.IsApproved)
                return StatusCode(403, new { message = "Your account is not approved yet." });

            var tenders = await _context.Tenders
                .OrderByDescending(t => t.ClosingDate)
                .ToListAsync();

            return Ok(tenders);
        }

        // ------------------------ 5. SUBMIT PROPOSAL ------------------------

        // POST: /api/supplier/submit-proposal
        // Allows an approved supplier to submit a proposal to an open tender
        [HttpPost("submit-proposal")]
        public async Task<IActionResult> SubmitProposal([FromBody] SubmitProposalDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users
                .Include(u => u.Supplier)
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null || user.Supplier == null)
                return Unauthorized("You must be a registered supplier.");

            if (!user.IsApproved)
                return StatusCode(403, new { message = "Your account is not approved yet." });

            var tender = await _context.Tenders.FindAsync(dto.TenderId);
            if (tender == null || !tender.IsOpen || tender.ClosingDate <= DateTime.UtcNow)
                return BadRequest("Invalid or closed tender.");

            var proposal = new TenderProposal
            {
                TenderId = tender.Id,
                SupplierId = user.Supplier.Id,
                QuotedPrice = dto.QuotedPrice,
                ProposalDocumentUrl = dto.ProposalDocumentUrl
            };

            _context.TenderProposals.Add(proposal);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tender proposal submitted successfully." });
        }

        // ------------------------ 6. GET MY PROPOSALS ------------------------

        // GET: /api/supplier/my-proposals
        // Returns all proposals submitted by the logged-in supplier with tender details
        [HttpGet("my-proposals")]
        public async Task<IActionResult> GetMyProposals()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users
                .Include(u => u.Supplier)
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null || user.Supplier == null)
                return Unauthorized("Supplier not found.");

            var proposals = await _context.TenderProposals
                .Where(p => p.SupplierId == user.Supplier.Id)
                .Include(p => p.Tender)
                .Select(p => new TenderProposalDto
                {
                    ProposalId = p.Id,
                    TenderTitle = p.Tender.Title,
                    QuotedPrice = p.QuotedPrice,
                    Status = p.Status,
                    SubmittedAt = p.SubmittedAt,
                    DocumentUrl = p.ProposalDocumentUrl
                })
                .ToListAsync();

            return Ok(proposals);
        }

        // ------------------------ 7. SUPPLIER DASHBOARD STATS ------------------------

        // GET: /api/supplier/dashboard
        // Returns dashboard statistics for the supplier's submitted proposals
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users
                .Include(u => u.Supplier)
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == "supplier");

            if (user == null || user.Supplier == null)
                return Unauthorized("Supplier not found.");

            var supplierId = user.Supplier.Id;

            var totalProposals = await _context.TenderProposals.CountAsync(p => p.SupplierId == supplierId);
            var approvedProposals = await _context.TenderProposals.CountAsync(p => p.SupplierId == supplierId && p.Status == "Approved");
            var pendingProposals = await _context.TenderProposals.CountAsync(p => p.SupplierId == supplierId && p.Status == "Pending");
            var rejectedProposals = await _context.TenderProposals.CountAsync(p => p.SupplierId == supplierId && p.Status == "Rejected");

            return Ok(new
            {
                totalProposals,
                approvedProposals,
                pendingProposals,
                rejectedProposals
            });
        }
    }
}
