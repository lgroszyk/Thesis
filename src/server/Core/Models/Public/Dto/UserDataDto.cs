using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania adresu email użytkownika
  public class UserDataDto
  {
    [Required, MaxLength(64), EmailAddress]
    public string Email { get; set; }
  }
}
