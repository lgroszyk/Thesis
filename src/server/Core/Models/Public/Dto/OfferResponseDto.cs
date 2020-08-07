using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania szczegółów dotyczących oferty sprzedaży książki do antykwariatu
  public class OfferResponseDto
  {
    [Required]
    public int Id { get; set; }
    
    [Required, Column(TypeName="date")]
    public DateTime ResponseDate { get; set; } = DateTime.Now;

    [Required]
    public int OfferId { get; set; }

    [Required, ForeignKey(nameof(OfferResponseStatus))]
    public int OfferResponseStatusId { get; set; }

    public virtual OfferResponseStatus OfferResponseStatus { get; set; }

    [MaxLength(8192)]
    public string ResponseText { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ProposedPrice { get; set; }
  }
}
