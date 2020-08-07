using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania pliku z serwera
  public class DownloadFileDto
  {
    [Required]
    public string Name { get; set; }

    [Required]
    public string Type { get; set; }
  }
}
