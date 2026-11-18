using System.ComponentModel.DataAnnotations;

namespace SPC.API.DTOs
{
    public class AddStockDto
    {
        [Required(ErrorMessage = "DrugId is required.")]
        public int DrugId { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "SourceType is required.")]
        [RegularExpression("^(external|internal|admin)$", ErrorMessage = "SourceType must be 'external', 'internal', or 'admin'.")]
        public string SourceType { get; set; } = "external";
    }
}
