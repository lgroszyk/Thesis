using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca status odpowiedzi administratora do oferty sprzedaży książki
  public class OfferResponseStatus : Entity
  {
    [Required, MaxLength(64)]
    public string NamePl { get; set; }

    [Required, MaxLength(64)]
    public string NameEn { get; set; }

    public virtual ICollection<OfferResponse> OfferResponses { get; set; }
  }
}
