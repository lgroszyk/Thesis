using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący ogólnego opisu zamówienia
  public class OrderByIdInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public IEnumerable<OrdersBookInfoDto> Books { get; set; }

    [Required]
    public string StatusEn { get; set; }
  }
}
