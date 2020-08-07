using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między użytkownikami a rolami 
  public class UserRole : Entity
  {
    [Required, ForeignKey(nameof(User))]
    public int UserId { get; set; }

    [Required, ForeignKey(nameof(Role))]
    public int RoleId { get; set; }

    public virtual Role Role { get; set; }
    public virtual User User { get; set; }
  }
}
