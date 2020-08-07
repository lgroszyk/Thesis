using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models
{
  // Klasa bazowa dla encji aplikacji
  public abstract class Entity
  {
    [Key]
    public int Id { get; set; }
  }
}
