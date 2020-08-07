using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje pobierania fraz wyświetlanych w interfejsie użytkownika
  public interface IResourceService
  {
    // Przekazuje frazy wyświetlane w interfejsie użytkownika w zależności od wersji językowej i aktualnie uruchomionej podstrony.
    ContentResult<ResourcesDto> GetResources(string language, string group, string prefix);
  }
}
