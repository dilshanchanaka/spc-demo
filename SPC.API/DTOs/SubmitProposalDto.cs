namespace SPC.API.DTOs
{
    public class SubmitProposalDto
    {
        public int TenderId { get; set; }
        public decimal QuotedPrice { get; set; }
        public string ProposalDocumentUrl { get; set; } = null!; // can be a file link or text
    }
}
