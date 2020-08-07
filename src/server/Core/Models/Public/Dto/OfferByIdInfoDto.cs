using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących oferty sprzedaży książki do antykwariatu
  public class OfferByIdInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string About { get; set; }

    [Required]
    public string Condition { get; set; }

    [Required]
    public string Category { get; set; }

    [Required]
    public string Language { get; set; }

    [Required]
    public bool IsEbook { get; set; }

    [Required]
    public string WritingTime { get; set; }

    [Required]
    public string PrintingTime { get; set; }

    [Required]
    public decimal TransactionPrice { get; set; }

    public OfferByIdResponseInfoDto Response { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public string StatusEn { get; set; }

    public int? StatusId { get; set; }
  }
}
