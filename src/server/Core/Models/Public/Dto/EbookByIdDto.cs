using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących ebooka znajdującego się na serwerze
  public class EbookByIdInfoDto
  {
    [Required]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; }
  }
}
