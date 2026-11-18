namespace SPC.API.DTOs
{
    public class TenderDto
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime ClosingDate { get; set; }
    }
}
