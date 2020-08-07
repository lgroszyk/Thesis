using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między aktualnościami a zdjęciami 
  public class NewsPhoto : Entity
  {
    [Required, ForeignKey(nameof(News))]
    public int NewsId { get; set; }

    [Required, ForeignKey(nameof(Photo))]
    public int PhotoId { get; set; }

    public virtual News News { get; set; }
    public virtual Photo Photo { get; set; }

    [Required]
    public bool IsMainPhoto { get; set; } = false;
  }
}
