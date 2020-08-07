using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między książkami a kategoriami 
  public class BookCategory : BookItem
  {
    [Required, ForeignKey(nameof(Category))]
    public int CategoryId { get; set; }

    public virtual Category Category { get; set; }
  }
}
