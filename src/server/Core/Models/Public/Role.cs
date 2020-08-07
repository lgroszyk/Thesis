using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca rolę użytkownika, określającą jego uprawnienia w aplikacji
  public class Role : Entity
  {
    [Required, MaxLength(32)]
    public string Name { get; set; }

    public virtual ICollection<UserRole> RoleUsers { get; set; }
  }
}
