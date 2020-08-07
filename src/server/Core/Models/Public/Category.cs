using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca kategorię książki
  public class Category : Entity
  {
    [Required, MaxLength(64)]
    public string NamePl { get; set; }

    [Required, MaxLength(64)]
    public string NameEn { get; set; }

    public virtual ICollection<BookCategory> BooksCategories { get; set; }
  }
}
