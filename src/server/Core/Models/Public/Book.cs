using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca książkę
  public class Book : Entity
  {
    [MaxLength(32)]
    public string ISBN { get; set; }

    [Required, MaxLength(256)]
    public string Title { get; set; }

    [Required, Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required, MaxLength(8192)]
    public string DescriptionPl { get; set; }

    [Required, MaxLength(8192)]
    public string DescriptionEn { get; set; }

    [Required, Column(TypeName="date")]
    public DateTime ReleaseDate { get; set; }

    [Required, Column(TypeName="date")]
    public DateTime PurchaseByStoreDate { get; set; }

    [Required]
    public bool IsElectronic { get; set; }

    [Required]
    public bool HadEverOrder { get; set; } = false;

    public virtual ICollection<BookLanguage> BooksLanguages { get; set; }

    public virtual ICollection<BookCategory> BooksCategories { get; set; }

    public virtual ICollection<BookAuthor> BooksAuthors { get; set; }

    public virtual ICollection<BookPhoto> BooksPhotos { get; set; }

    [ForeignKey(nameof(Order))]
    public int? OrderId { get; set; }
    
    public virtual Order Order { get; set; }
  }
}
