using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji wgrania oferowanego przez klienta ebooka na serwer
  public class SendEbookDto
  {
    [Required]
    public int OfferId { get; set; }

    [Required]
    public IFormFile File { get; set; }
  }
}
