using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca relację między książkami a językami 
  public class BookLanguage : BookItem
  {
    [Required, ForeignKey(nameof(Language))]
    public int LanguageId { get; set; }

    public virtual Language Language { get; set; }
  }
}
