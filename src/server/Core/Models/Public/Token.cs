using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca losowo wygenerowany token przypisany do użytkownika w celu weryfikacji jego konta
  public class Token : Entity
  {
    [Required, MaxLength(64)]
    public string Name { get; set; }

    [Required, MaxLength(128)]
    public string Value { get; set; }

    [Required]
    public DateTime ExpirationDate { get; set; } = DateTime.Now.AddMinutes(10);

    [Required, ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public virtual User User { get; set; }
  }
}
