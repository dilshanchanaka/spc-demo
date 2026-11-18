namespace SPC.API.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int DrugId { get; set; }
        public Drug Drug { get; set; } = null!;

        public int UserId { get; set; } // pharmacy user
        public User User { get; set; } = null!;

        public int Quantity { get; set; }
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending"; // Admin/warehouse can later mark as Delivered
        public DateTime? DeliveredAt { get; set; }

    }
}
