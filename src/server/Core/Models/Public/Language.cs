using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca język książki
  public class Language : Entity
  {
    [Required, MaxLength(32)]
    public string NamePl { get; set; }

    [Required, MaxLength(32)]
    public string NameEn { get; set; }

    public virtual ICollection<BookLanguage> BooksLanguages { get; set; }
  }
}
