using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  public class ResourcesDto
  {
    [Required]
    public Dictionary<string, string> Resources { get; set; }
  }
}
