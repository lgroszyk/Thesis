namespace LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses
{
  // Status reprezentujący operację logowania na konto użytkownika
  public enum LoginStatus
  {
    LoggedIn,
    EmailNotConfirmed,
    BadCredentials,
    TooManyLoginAttempts
  }
}
