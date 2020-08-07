using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji edycji statusu zamówienia
  public class OrderStatusEditDto
  {
    [Required]
    public int StatusId { get; set; }
  }
}
