using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących nazwy pliku ebooka znajdującego się na serwerze
  public class FileNameDto
  {
    [Required, MaxLength(128)]
    public string Name { get; set; }
  }
}
