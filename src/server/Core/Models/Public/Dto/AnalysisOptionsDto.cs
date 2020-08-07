using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący właściwości opisujących oferowane książki w celu analizy ich cen
  public class AnalysisOptionsDto
  {
    [Required]
    public IEnumerable<string> AuthorPopularityOptions { get; set; }

    [Required]
    public IEnumerable<string> ConditionOptions { get; set; }

    [Required]
    public IEnumerable<string> CategoryOptions { get; set; }

    [Required]
    public IEnumerable<string> LanguageOptions { get; set; }

    [Required]
    public IEnumerable<string> WritingTimeOptions { get; set; }

    [Required]
    public IEnumerable<string> PrintingTimeOptions { get; set; }
  }
}
