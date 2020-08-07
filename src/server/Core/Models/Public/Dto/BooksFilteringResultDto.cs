using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący wyniku operacji filtrowania książek z oferty antykwariatu
  public class BooksFilteringResultDto
  {
    [Required]
    public IEnumerable<Book> Books { get; set; }

    [Required]
    public int TotalBooksCountForThisFilter { get; set; }
  }
}
