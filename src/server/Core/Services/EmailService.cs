using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące wysyłania emailów do użytkowników aplikacji
  public class EmailService : IEmailService
  {
    private readonly AppDbContext context;
    private readonly IConfiguration configuration;

    public EmailService(AppDbContext context, IConfiguration configuration)
    {
      this.context = context;
      this.configuration = configuration;
    }

    // Wysyła emaila potwierdzającego usunięcie konta użytkownika.
    public StatusResult<EmailSendingStatus> SendAccountDeleteEmail(string clientEmail)
    {
      var subject = "Usunięcie konta";
      var body = $"<h1>Usunięto konto w serwisie.</h1><p>Dziękujemy za korzystanie z serwisu.</p>";

      SendEmail(clientEmail, clientEmail, subject, body).Wait();

      return new StatusResult<EmailSendingStatus>
      {
        Status = EmailSendingStatus.Ok
      };    
    }

    // Wysyła emaila weryfikującego adres email podany podczas rejestracji konta użytkownika.
    public StatusResult<EmailSendingStatus> SendConfirmationEmail(string clientName, string clientEmail, string confirmationToken)
    {
      var subject = "Potwierdź założenie konta";
      var body = $"<h1>Witaj {clientName}!</h1><p>Potwierdź założenie konta w serwisie, klikając w link: https://antykwariat.azurewebsites.net/confirm_account/{confirmationToken}.</p><p>Jeśli to nie Ty zarejestrowałeś się na portalu LGA, zignoruj tą wiadomość.</p>";

      SendEmail(clientName, clientEmail, subject, body).Wait();

      return new StatusResult<EmailSendingStatus>
      {
        Status = EmailSendingStatus.Ok
      };
    }

    // Metoda pomocnicza definiująca dane niezbędne do wysłania emaila.
    private async Task SendEmail(string userName, string userEmail, string subject, string body) 
    {
      var adminName = configuration["Email:Name"];
      var adminEmail = configuration["Email:Address"];
      var key = configuration["Email:Key"];
      
      await SendEmail(key, adminName, adminEmail, userName, userEmail, subject, body);
    }

    // Metoda pomocnicza bezpośrednio odpowiedzialna za wysłanie emaila
    private async Task SendEmail(string key, string adminName, string adminEmail, string userName, string userEmail, string subject, string body)
    {
      var client = new SendGridClient(key);
      var from = new EmailAddress(adminEmail, adminName);
      var to = new EmailAddress(userEmail, userName);
      var msg = MailHelper.CreateSingleEmail(from, to, subject, string.Empty, body);
      
      await client.SendEmailAsync(msg);
		}
  }
}
