using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Services.Public;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje pobierania fraz wyświetlanych w interfejsie użytkownika
  public class ResourceService : IResourceService
  {
    private readonly IHostingEnvironment hostingEnvironment;

    public ResourceService(IHostingEnvironment hostingEnvironment)
    {
      this.hostingEnvironment = hostingEnvironment;
    }

    // Przekazuje frazy wyświetlane w interfejsie użytkownika w zależności od wersji językowej i aktualnie uruchomionej podstrony.
    public ContentResult<ResourcesDto> GetResources(string language, string group, string prefix)
    {
      var availableLanguages = new [] { "en", "pl" };
      var defaultLanguage = "pl";
      if (!availableLanguages.Contains(language))
      {
        language = defaultLanguage;
      }
      
      var fileName = hostingEnvironment.ContentRootPath + "/private_static/resources/resources_" + language + ".json";
      var fileContent = System.IO.File.ReadAllText(fileName);
      var allResourcesFromFile = JsonConvert.DeserializeObject<Dictionary<string, string>>(fileContent);

      var commonResources = allResourcesFromFile
        .Where(x => x.Key.StartsWith($"{group}_common"))
        .ToDictionary(x => x.Key, x => x.Value);

      var particularResources = allResourcesFromFile
        .Where(x => x.Key.StartsWith($"{group}_{prefix}"))
        .ToDictionary(x => x.Key, x => x.Value);

      var allRequestedResources = particularResources
        .Union(commonResources)
        .ToDictionary(x => x.Key, x => x.Value);
      
      return new ContentResult<ResourcesDto>
      {
        Content = new ResourcesDto
        {
          Resources = allRequestedResources
        }
      };
    }
  }
}
