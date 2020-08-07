using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Klasa pomocnicza reprezentująca relację między książkami a ich właściwościami 
  public class BookItem : Entity
  {
    [Required, ForeignKey(nameof(Book))]
    public int BookId { get; set; }
    
    public virtual Book Book { get; set; }
  }
}
