namespace SPC.API.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public int UserId { get; set; }

        public User User { get; set; } = null!;
    }
}
