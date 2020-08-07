using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące informacji o antykwariacie oraz nieaktualnych wpisów w bazie danych
  public interface IConfigService
  {
    // Przekazuje możliwe wartości właściwości książki używanych w procesie analizy ceny oferty.
    ContentResult<AnalysisOptionsDto> GetAnalysisOptions();

    // Przekazuje informacje o antykwariacie.
    ContentResult<Config> GetConfig();

    // Edytuje informacje o antykwariacie.
    StatusResult<BasicEditStatus> SetConfig(Config config);

    // Usuwa z bazy danych przedawnionych wpisów oraz w usuwa z serwera ebooki zakupione przez użytkowników strony więcej niż tydzień temu.
    StatusResult<BasicAddStatus> MaintainDatabase();
  }
}
