namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację zmiany właściciela pliku ebooka znajdującego się na serwerze
  public enum EditFileOwnerNameStatus
  {
    Ok,
    BadId,
    Conflict,
    UserNotFound
  }
}
