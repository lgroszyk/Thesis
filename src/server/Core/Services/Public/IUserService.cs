using System.Collections.Generic;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące użytkowników strony
  public interface IUserService
  {
    // Loguje na konto użytkownika.
    FullResult<string, LoginStatus> LogIn(string username, string password);

    // Rejestruje nowe konto użytkownika.
    StatusResult<RegisterStatus> Register(RegisterDto user, IEnumerable<string> roleTypes);

    // Przekazuje dane użytkowników do panelu administracyjnego strony.
    ContentResult<IEnumerable<UserInfoDto>> GetAllUsers();

    // Przekazuje dane konkretnego użytkownika do panelu administracyjnego strony.
    ContentResult<UserInfoDto> GetUserById(int id);

    // Potwierdza adres email podany podczas rejestracji użytkownika.
    StatusResult<ConfirmAccountStatus> ConfirmAccount(string confirmationToken);

    // Usuwa konta użytkownika na żądanie administratora.
    StatusResult<BasicDeleteStatus> DeleteUser(int id);

    // Zmienia hasło użytkownika.
    StatusResult<ChangePasswordStatus> ChangePassword(string username, ChangePasswordDto dto);

    // Usuwa własne konto użytkownika.
    StatusResult<BasicDeleteStatus> DeleteMe(string username);

    // Przekazuje adres email aktualnie zalogowanego użytkownika.
    ContentResult<string> GetMyEmail(string username);
  }
}
