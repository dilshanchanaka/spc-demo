namespace SPC.API.Models
{
    public class Drug
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Manufacturer { get; set; } = null!;
        public DateTime ExpiryDate { get; set; }
        public int TotalQuantity { get; set; } = 0;

        public ICollection<StockEntry> StockEntries { get; set; } = new List<StockEntry>();
    }
}
