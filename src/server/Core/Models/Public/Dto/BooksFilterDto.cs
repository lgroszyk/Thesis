using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using LGroszyk.AntiqueBookShop.Core.Models.Public;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji filtrowania książek z oferty antykwariatu
  public class BooksFilterDto
  {
    [Required]
    public int Page { get; set; }

    [Required]
    public int BooksPerPage { get; set; }
    
    [MaxLength(64)]
    public string TitleOrAuthorFilter { get; set; }

    public bool? IsElectronic { get; set; }
    
    public IEnumerable<int> CategoriesIds { get; set; }
    public IEnumerable<int> KindsIds { get; set; }
    public IEnumerable<int> LanguagesIds { get; set; }
    public IEnumerable<int> AuthorsIds { get; set; }
    public DateTime? ReleaseMinimumDate { get; set; }
    public DateTime? ReleaseMaximumDate { get; set; }
    public DateTime? PurchaseMinimumDate { get; set; }
    public DateTime? PurchaseMaximumDate { get; set; }

    public decimal? MaximumPrice { get; set; }
  }
}
