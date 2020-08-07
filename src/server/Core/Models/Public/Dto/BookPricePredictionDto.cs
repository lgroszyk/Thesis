using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji wyceny oferowanej książki przez system analityczny
  public class BookPricePredictionDto
  {
    [Required]
    public decimal PredictedPrice { get; set; }
  }
}
