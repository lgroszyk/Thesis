using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  public class Order : Entity
  {
    [Required, Column(TypeName="date")]
    public DateTime Date { get; set; } = DateTime.Now;

    [Required, ForeignKey(nameof(OrderStatus))]
    public int OrderStatusId { get; set; }

    public virtual OrderStatus OrderStatus { get; set; }

    [ForeignKey(nameof(User))]
    public int? UserId { get; set; }

    public virtual User User { get; set; }

    [Required, MaxLength(64), EmailAddress]
    public string UserEmail { get; set; }

    public virtual ICollection<Book> Books { get; set; }
  }
}
