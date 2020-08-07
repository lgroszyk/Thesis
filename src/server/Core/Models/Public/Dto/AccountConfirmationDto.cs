using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji potwierdzenia adresu email konta użytkownika
  public class AccountConfirmationDto
  {
    [Required]
    public string Token { get; set; }
  }
}
