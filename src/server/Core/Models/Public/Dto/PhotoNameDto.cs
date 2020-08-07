using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji edycji nazwy pliku zdjęcia znajdującego się na serwerze
  public class PhotoNameDto
  {
    [Required, MaxLength(128)]
    public string Name { get; set; }
  }
}
