using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania książek znajdującyh się w zamówieniu
  public class OrdersBookInfoDto
  {
    [Required]
    public string Title { get; set; }

    [Required]
    public decimal Price { get; set; }
  }
}
