using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących zamówienia
  public class OrderInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public int BooksCount { get; set; }

    [Required]
    public decimal TotalPrice { get; set; }

    [Required]
    public string StatusEn { get; set; }
  }
}
