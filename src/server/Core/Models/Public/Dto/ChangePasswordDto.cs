using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji zmiany hasła użytkownika
  public class ChangePasswordDto
  {
    [Required, MaxLength(64)]
    public string OldPassword { get; set; }

    [Required, MaxLength(64), RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")]
    public string NewPassword { get; set; }
  }
}
