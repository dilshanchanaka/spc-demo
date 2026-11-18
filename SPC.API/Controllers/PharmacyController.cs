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
    [Authorize(Roles = "pharmacy")] // Restricts all endpoints in this controller to users with the 'pharmacy' role
    public class PharmacyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PharmacyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------------ 1. SEARCH DRUGS ------------------------

        // GET: /api/pharmacy/search?query=xxx
        // Searches drugs by name or description using the given query string
        [HttpGet("search")]
        public async Task<IActionResult> SearchDrugs([FromQuery] string query)
        {
            var drugs = await _context.Drugs
                .Where(d => d.Name.Contains(query) || d.Description.Contains(query))
                .ToListAsync();

            return Ok(drugs);
        }

        // ------------------------ 2. GET DRUG DETAILS ------------------------

        // GET: /api/pharmacy/drug/{id}
        // Returns details of a single drug by its ID
        [HttpGet("drug/{id}")]
        public async Task<IActionResult> GetDrugDetail(int id)
        {
            var drug = await _context.Drugs.FindAsync(id);
            if (drug == null) return NotFound("Drug not found.");
            return Ok(drug);
        }

        // ------------------------ 3. PLACE ORDER ------------------------

        // POST: /api/pharmacy/orders
        // Places a new drug order for the currently authenticated pharmacy user
        [HttpPost("orders")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!); // Get current user ID

            var drug = await _context.Drugs.FindAsync(dto.DrugId);
            if (drug == null) return NotFound("Drug not found.");

            if (dto.Quantity <= 0)
                return BadRequest("Quantity must be greater than 0.");

            var order = new Order
            {
                DrugId = dto.DrugId,
                UserId = userId,
                Quantity = dto.Quantity,
                Status = "Pending"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully." });
        }

        // ------------------------ 4. VIEW MY ORDERS ------------------------

        // GET: /api/pharmacy/orders/mine
        // Returns a list of orders placed by the current pharmacy user
        [HttpGet("orders/mine")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Drug)
                .Select(o => new
                {
                    o.Id,
                    Drug = o.Drug.Name,
                    o.Quantity,
                    o.Status,
                    o.OrderedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        // ------------------------ 5. CREATE DRUG (for testing/demo) ------------------------

        // POST: /api/pharmacy/drugs
        // Creates a new drug entry in the system (for pharmacy role testing/demo)
        [HttpPost("drugs")]
        public async Task<IActionResult> CreateDrug([FromBody] DrugDto dto)
        {
            var drug = new Drug
            {
                Name = dto.Name,
                Description = dto.Description,
                Manufacturer = dto.Manufacturer,
                ExpiryDate = dto.ExpiryDate,
                TotalQuantity = 0
            };

            _context.Drugs.Add(drug);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Drug created successfully." });
        }

        // ------------------------ 6. GET ALL DRUGS ------------------------

        // GET: /api/pharmacy/drugs
        // Returns a list of all available drugs ordered by name
        [HttpGet("drugs")]
        public async Task<IActionResult> GetAllDrugs()
        {
            var drugs = await _context.Drugs
                .OrderBy(d => d.Name)
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.Description,
                    d.Manufacturer,
                    d.ExpiryDate,
                    d.TotalQuantity
                })
                .ToListAsync();

            return Ok(drugs);
        }
    }
}
