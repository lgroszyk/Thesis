namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację potwierdzenia adresu email konta użytkownika
  public enum ConfirmAccountStatus
  {
    TokenNotFound,
    TokenExpired,
    Ok,
  }
}
