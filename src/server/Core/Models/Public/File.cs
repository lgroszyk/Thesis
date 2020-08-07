using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca ebooka wgranego na serwer
  public class File : Entity
  {
    [Required, MaxLength(1024)]
    public string Name { get; set; }

    [Required]
    public DateTime UploadDate { get; set; } = DateTime.Now;

    public DateTime? ShareTime { get; set; }

    [ForeignKey(nameof(User))]
    public int? UserId { get; set; }

    public virtual User User { get; set; }
  }
}
