using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących informacji o antykwariacie oraz usuwania nieaktualnych danych z bazy
  [Route("api/config")]
  [Authorize(Roles = "Admin")] 
  public class ConfigController : Controller
  {
    private readonly IConfigService configService;

    public ConfigController(IConfigService configService)
    {
      this.configService = configService;
    }
    
    // Pośredniczy w przekazaniu możliwych wartości właściwości książki używanych w procesie analizy ceny oferty.
    [HttpGet("analysis_options")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAnalysisOptions()
    {
      var options = configService.GetAnalysisOptions().Content;

      return Ok(options);
    }

    // Pośredniczy w przekazaniu informacji o antykwariacie.
    [HttpGet("")]
    [AllowAnonymous]
    public IActionResult GetConfig()
    {
      var config = configService.GetConfig().Content;

      return Ok(config);
    }

    // Pośredniczy w edycji informacji o antykwariacie.
    [HttpPost("change")]
    [Authorize(Roles = "Admin")]

    public IActionResult SetConfig([FromBody]Config config)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      configService.SetConfig(config);

      return NoContent();
    }

    // Pośredniczy w usunięciu z bazy danych przedawnionych wpisów oraz w usunięciu z serwera ebooków zakupionych przez użytkowników strony wcześniej niż tydzień temu.
    [HttpGet("maintain")]
    [Authorize(Roles = "Admin")]
    public IActionResult MaintainDb()
    {
      var maintananceResult = configService.MaintainDatabase().Status;

      switch (maintananceResult)
      {
        case BasicAddStatus.Ok:
          return NoContent();
        
        default:
          return StatusCode(500);
      }
    }
  }
}
