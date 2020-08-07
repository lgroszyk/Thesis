namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację zmianę nazwy pliku ze zdjęciem znajdującego się na serwerze
  public enum EditPhotoNameStatus
  {
    Ok,
    BadId,
    Conflict
  }
}
