using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca status oferty sprzedaży książki
  public class OfferStatus : Entity
  {
    [Required, MaxLength(64)]
    public string NamePl { get; set; }

    [Required, MaxLength(64)]
    public string NameEn { get; set; }

    public virtual ICollection<Offer> Offers { get; set; }
  }
}
