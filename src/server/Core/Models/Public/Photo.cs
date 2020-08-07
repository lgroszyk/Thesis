using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca zdjęcie wgrane na serwer
  public class Photo : Entity
  {
    [Required, MaxLength(256), Url]
    public string Url { get; set; }

    public virtual ICollection<BookPhoto> BooksPhotos { get; set; }
    
    public virtual ICollection<NewsPhoto> NewsPhotos { get; set; }
  }
}
