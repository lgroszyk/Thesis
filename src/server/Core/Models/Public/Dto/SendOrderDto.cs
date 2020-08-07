using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący wysłania zamówienia do antykwariatu
  public class SendOrderDto
  {
    [Required]
    public IEnumerable<int> BooksIds { get; set; }
  }
}
