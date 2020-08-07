using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca ofertę sprzedaży książki
  public class Offer : Entity
  {
    [Required, Column(TypeName="date")]
    public DateTime Date { get; set; } = DateTime.Now;

    [Required, MaxLength(8192)]
    public string About { get; set; }    

    [Required, MaxLength(8192)]
    public string Condition { get; set; }

    [Required, MaxLength(8192)]
    public string Category { get; set; }
    
    [Required, MaxLength(8192)]
    public string Language { get; set; }
    
    [Required]
    public bool IsEbook { get; set; }
    
    [Required, MaxLength(8192)]
    public string WritingTime { get; set; }
    
    [Required, MaxLength(8192)]
    public string PrintingTime { get; set; }
    
    [Required, Column(TypeName = "decimal(18,2)")]
    public decimal TransactionPrice { get; set; }

    [Required, ForeignKey(nameof(OfferStatus))]
    public int OfferStatusId { get; set; }

    public virtual OfferStatus OfferStatus { get; set; }

    [ForeignKey(nameof(OfferResponse))]
    public int? OfferResponseId { get; set; }

    public virtual OfferResponse OfferResponse { get; set; }

    [ForeignKey(nameof(User))]
    public int? UserId { get; set; }

    public virtual User User { get; set; }

    [ForeignKey(nameof(File))]
    public int? FileId { get; set; }

    public virtual File File { get; set; }
  }
}
