using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji rejestracji nowego konta użytkownika
  public class RegisterDto
  {
    [Required, MaxLength(16)]
    public string UserName { get; set; }
    
    [Required, MaxLength(64), RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]
    public string Password { get; set; }

    [Required, MaxLength(64), EmailAddress]
    public string Email { get; set; }
  }
}
