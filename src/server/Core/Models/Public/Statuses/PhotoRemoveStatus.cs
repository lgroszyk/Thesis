namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację usunięcia zdjęcia znajdującego się na serwerze
  public enum PhotoRemoveStatus
  {
    Ok,
    BadId,
    IsMainPhoto
  }
}
