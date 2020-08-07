using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  public class OrderStatus : Entity
  {
    [Required, MaxLength(64)]
    public string NamePl { get; set; }

    [Required, MaxLength(64)]
    public string NameEn { get; set; }

    public virtual ICollection<Order> Orders { get; set; }
  }
}
