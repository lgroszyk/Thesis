namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację zmiany nazwy pliku ebooka znajdującego się na serwerze
  public enum EditFileNameStatus
  {
    Ok,
    BadId,
    Conflict
  }
}
