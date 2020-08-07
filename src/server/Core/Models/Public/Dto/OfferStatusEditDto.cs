using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji edycji statusu oferty sprzedaży książki do antykwariatu
  public class OfferStatusEditDto
  {
    [Required]
    public int StatusId { get; set; }
  }
}
