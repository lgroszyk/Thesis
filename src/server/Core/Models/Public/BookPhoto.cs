using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między książkami a zdjęciami 
  public class BookPhoto : BookItem
  {
    [Required, ForeignKey(nameof(Photo))]
    public int PhotoId { get; set; }

    public virtual Photo Photo { get; set; }

    [Required]
    public bool IsMainPhoto { get; set; } = false;
  }
}
