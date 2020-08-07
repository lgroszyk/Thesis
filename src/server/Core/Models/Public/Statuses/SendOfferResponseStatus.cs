namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację wysłania przez administratora odpowiedzi do oferty sprzedaży książki
  public enum SendOfferResponseStatus
  {
    Ok,
    NoOffer,
    OfferHasResponse
  }
}
