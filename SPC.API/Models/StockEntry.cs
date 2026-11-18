namespace SPC.API.Models
{
    public class StockEntry
    {
        public int Id { get; set; }

        public int DrugId { get; set; }
        public Drug Drug { get; set; } = null!;

        public int Quantity { get; set; }

        public string SourceType { get; set; } = "external"; // "external", "internal", etc.

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public string AddedBy { get; set; } = string.Empty;  // ✅ Add this line to track user
    }
}
