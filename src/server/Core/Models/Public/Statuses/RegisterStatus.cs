namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację rejestracji konta użytkownika
  public enum RegisterStatus
  {
    Registered,
    UsernameNotUnique,
    EmailNotUnique
  }
}
