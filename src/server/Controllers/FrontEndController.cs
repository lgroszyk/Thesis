using Microsoft.AspNetCore.Mvc;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler przekazujący dokument HTML z dołączonym kodem części klienckiej aplikacji.
  public class FrontEndController : Controller
  {
    // Przekazuje dokument HTML z dołączonym kodem części klienckiej aplikacji.
    [HttpGet]
    public IActionResult Index()
    {
      return File("~/index.html", "text/html");
    }
  }
}
