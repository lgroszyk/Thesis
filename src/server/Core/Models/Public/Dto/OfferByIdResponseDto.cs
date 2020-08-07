using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących odpowiedzi administratora do oferty sprzedaży książki do antykwariatu
  public class OfferByIdResponseInfoDto
  {
    [Required]
    public string Status { get; set; }

    [Required]
    public string StatusEn { get; set; }

    public int StatusId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public string Text { get; set; }

    public decimal? TransactionPrice { get; set; }
  }
}
