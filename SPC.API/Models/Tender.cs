namespace SPC.API.Models
{
    public class Tender
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime PublishDate { get; set; } = DateTime.UtcNow;
        public DateTime ClosingDate { get; set; }
        public bool IsOpen { get; set; } = true;
    }
}
