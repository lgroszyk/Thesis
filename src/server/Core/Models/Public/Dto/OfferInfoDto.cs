using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // DTO dotyczący operacji pobierania ogólnego opisu oferty sprzedaży książki do antykwariatu
  public class OfferInfoDto
  {
    [Required]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public string StatusEn { get; set; }
  }
}
