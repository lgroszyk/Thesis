using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w pobieraniu wyświetlanych fraz w zależności od wersji językowej strony oraz podstrony, na której aktualnie przebywa użytkownik. 
  [Route("api/resources")]
  public class ResourceController : Controller
  {
    private IResourceService resourceService;

    public ResourceController(IResourceService resourceService)
    {
      this.resourceService = resourceService;
    }

    // Pośredniczy w pobraniu fraz do panelu administracyjnego zależnych od wersji językowej i podstrony.
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/{language}/{prefix}")]
    public IActionResult GetAdminResources(string language, string prefix)
    {
      var resources = resourceService.GetResources(language, "admin", prefix);

      return Ok(resources);
    }

    // Pośredniczy w pobraniu fraz do części publicznej aplikacji zależnych od wersji językowej i podstrony.
    [AllowAnonymous]
    [HttpGet("{language}/{prefix}")]
    public IActionResult GetPublicResources(string language, string prefix)
    {
      if (prefix.Contains("admin"))
      {
        return Forbid();
      }

      var resources = resourceService.GetResources(language, "user", prefix);

      return Ok(resources);
    }
  }
}
