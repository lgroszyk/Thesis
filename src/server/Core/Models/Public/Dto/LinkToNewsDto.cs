using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący operacji pobierania linków do aktualności poprzedniej i następnej względem obecnie wyświetlanej aktualności
  public class LinkToNewsDto
  {
    [Required]
    public int Id { get; set; }

    [Required, StringLength(128)]
    public string Title { get; set; }
  }
}
