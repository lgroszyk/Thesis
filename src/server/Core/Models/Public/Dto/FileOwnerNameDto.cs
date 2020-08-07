using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących nazwy właściciela ebooka znajdującego się na serwerze
  public class FileOwnerNameDto
  {
    [MaxLength(16)]
    public string Name { get; set; }
  }
}
