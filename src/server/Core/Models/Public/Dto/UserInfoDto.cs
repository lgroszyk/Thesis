using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący pobierania szczegółów o użytkowniku
  public class UserInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required, MaxLength(16)]
    public string Name { get; set; }

    [Required, MaxLength(64), EmailAddress]
    public string Email { get; set; }

    [Required]
    public bool IsAdmin { get; set; }

    [Required]
    public IEnumerable<string> OrdersNumbers { get; set; }

    [Required]
    public IEnumerable<string> OffersNumbers { get; set; }

    [Required]
    public IEnumerable<string> FilesNumbers { get; set; }
  }
}
