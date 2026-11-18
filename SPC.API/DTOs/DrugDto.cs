namespace SPC.API.DTOs
{
    public class DrugDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Manufacturer { get; set; } = null!;
        public DateTime ExpiryDate { get; set; }
    }
}
