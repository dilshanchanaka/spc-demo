namespace SPC.API.Models
{
    public class TenderProposal
    {
        public int Id { get; set; }
        public int TenderId { get; set; }
        public Tender Tender { get; set; } = null!;

        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        public decimal QuotedPrice { get; set; }
        public string ProposalDocumentUrl { get; set; } = null!;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending"; // Approved, Rejected (optional admin flow)
    }
}
