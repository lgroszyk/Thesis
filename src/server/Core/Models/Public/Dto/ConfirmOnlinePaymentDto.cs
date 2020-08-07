using System.ComponentModel.DataAnnotations;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Dto
{
  // DTO dotyczący symulacji operacji potwierdzenia płatności online za zamówienie
  public class ConfirmOnlinePaymentDto
  {
    [Required]
    public int OrderId { get; set; }
  }
}
