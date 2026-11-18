namespace SPC.API.DTOs
{
    public class TenderProposalDto
    {
        public int ProposalId { get; set; }
        public string TenderTitle { get; set; } = null!;
        public decimal QuotedPrice { get; set; }
        public string Status { get; set; } = null!;
        public DateTime SubmittedAt { get; set; }
        public string DocumentUrl { get; set; } = null!;
    }
}
