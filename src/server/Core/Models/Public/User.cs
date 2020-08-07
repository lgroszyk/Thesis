using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  public class User : Entity
  {
    [Required, MaxLength(16)]
    public string Name { get; set; }

    [Required, MaxLength(128)]
    public string PasswordHash { get; set; }

    [Required, MaxLength(64), EmailAddress]
    public string Email { get; set; }

    [Required]
    public bool EmailConfirmed { get; set; } = false;

    public virtual ICollection<UserRole> UserRoles { get; set; }

    public virtual ICollection<Order> Orders { get; set; }

    public virtual ICollection<Offer> Offers { get; set; }

    public virtual ICollection<Token> Tokens { get; set; }

    public virtual ICollection<File> Files { get; set; }
  }
}
