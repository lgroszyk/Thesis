using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji wgrania przez administratora ebooka na serwer
  public class SendFileDto
  {
    [Required]
    public IFormFile File { get; set; }
  }
}
