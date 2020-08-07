using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentującą ofertę wysyłaną przez administratora do analizy ceny oferowanej książki
  public class FormalizedOffer
  {
    [Required, MaxLength(32)]
    public string AuthorPopularity { get; set; }

    [Required, MaxLength(32)]
    public string Condition { get; set; }

    [Required, MaxLength(32)]
    public string Category { get; set; }
    
    [Required, MaxLength(32)]
    public string Language { get; set; }
    
    [Required]
    public bool IsEbook { get; set; }
    
    [Required, MaxLength(32)]
    public string WritingTime { get; set; }
    
    [Required, MaxLength(32)]
    public string PrintingTime { get; set; }
  }
}
