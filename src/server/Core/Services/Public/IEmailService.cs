using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące wysyłania emailów do użytkowników aplikacji
  public interface IEmailService
  {
    // Wysyła emaila weryfikującego adres email podany podczas rejestracji konta użytkownika.
    StatusResult<EmailSendingStatus> SendConfirmationEmail(string clientName, string clientEmail, string confirmationToken);

    // Wysyła emaila potwierdzającego usunięcie konta użytkownika.
    StatusResult<EmailSendingStatus> SendAccountDeleteEmail(string clientEmail);
  }
}
