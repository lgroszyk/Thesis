using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między książkami a autorami
  public class BookAuthor : BookItem
  {
    [Required, ForeignKey(nameof(Author))]
    public int AuthorId { get; set; }

    public virtual Author Author { get; set; }
  }
}
