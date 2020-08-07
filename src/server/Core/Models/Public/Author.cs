using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca autora książki
  public class Author : Entity
  {
    [Required, MaxLength(32)]
    public string FirstName { get; set; }

    [Required, MaxLength(64)]
    public string LastName { get; set; }

    [MaxLength(32)]
    public string NickName { get; set; }
    
    public virtual ICollection<BookAuthor> AuthorBooks { get; set; }
  }
}
