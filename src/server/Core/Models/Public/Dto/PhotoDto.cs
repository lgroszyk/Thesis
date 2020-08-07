using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących zdjęcia znajdującego się na serwerze
  public class PhotoDto
  {
    [Required]
    public int Id { get; set; }

    [Required, MaxLength(128)]
    public string Name { get; set; }

    [Required, MaxLength(256)]
    public string Url { get; set; }

    public IEnumerable<int> BooksNumbers { get; set; }
    
    public IEnumerable<int> NewsNumbers { get; set; }
  }
}
