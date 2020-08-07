using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Encja reprezentująca aktualność o antykwariacie
  public class News : Entity
  {
    [Required, StringLength(128)]
    public string Title { get; set; }

    [Required, StringLength(8192)]
    public string Content { get; set; }

    [Required, StringLength(1024)]
    public string Description { get; set; }

    [Required, Column(TypeName="date")]
    public DateTime Date { get; set; }

    [Required, MaxLength(16)]
    public string PublisherName { get; set; }
    
    public virtual ICollection<NewsPhoto> NewsPhotos { get; set; }
  }
}
