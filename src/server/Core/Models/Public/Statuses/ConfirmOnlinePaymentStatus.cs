namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację symulacji płatności online za zamówienie
  public enum ConfirmOnlinePaymentStatus
  {
    Ok,
    OfferNotFound,
    OfferNotBelongsToDesignatedUser
  }
}
