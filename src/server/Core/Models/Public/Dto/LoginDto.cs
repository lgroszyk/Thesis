using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji logowania na konto użytkownika
  public class LoginDto
  {
    [Required, MaxLength(16)]
    public string UserName { get; set; }

    [Required, MaxLength(64)]
    public string Password { get; set; }
  }
}
