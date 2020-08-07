using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using Microsoft.AspNetCore.Http;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using System.Collections.Generic;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących ofert sprzedaży książki do antykwariatu
  [Route("api/offers")]
  [Authorize]
  public class OfferController : Controller
  {
    private readonly IOfferService offerService;

    public OfferController(IOfferService offerService)
    {
      this.offerService = offerService;
    }

    // Pośredniczy w przekazaniu danych ofert sprzedaży książki do panelu administracyjnego strony.
    [HttpGet("")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllOffers()
    {
      var offers = offerService.GetAllOffers().Content;

      return Ok(offers);
    }

    // Pośredniczy w przekazaniu danych konkretnej oferty sprzedaży książki do panelu administracyjnego strony.
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetOfferById(int id)
    {
      var offer = offerService.GetOfferById(id).Content;

      if (offer == null)
      {
        return NotFound();
      }

      return Ok(offer);
    }

    // Pośredniczy w przekazaniu wszystkich możliwych statusów oferty sprzedaży książki.
    [HttpGet("statuses")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetOfferStatuses()
    {
      var statuses = offerService.GetOfferStatuses().Content;

      return Ok(statuses);
    }

    // Pośredniczy w przekazaniu wszystkich możliwych statusów odpowiedzi administratora do oferty sprzedaży książki.
    [HttpGet("response/statuses")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetOfferResponseStatuses()
    {
      var statuses = offerService.GetOfferResponseStatuses().Content;

      return Ok(statuses);
    }

    // Pośredniczy w przesłaniu oferty sprzedaży książki do antykwariatu.
    [HttpPost]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult SendOffer([FromBody]Offer offer)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var sendStatus = offerService.SendOffer(username, offer).Status;

      switch (sendStatus)
      {
        case BasicAddStatus.Ok:
          return NoContent();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przesłaniu odpowiedzi administratora do oferty sprzedaży książki.
    [HttpPost("response/add")]
    [Authorize(Roles = "Admin")]
    public IActionResult SendResponse([FromBody]OfferResponseDto offerResponse)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var sendStatus = offerService.SendResponseToOffer(offerResponse).Status;

      switch (sendStatus)
      {
        case SendOfferResponseStatus.Ok:
          return NoContent();
          
        default:
          return StatusCode(500);
      }    
    }

    // Pośredniczy we wgraniu pliku przez użytkownika w celu sprzedaży ebooka.
    [HttpPost("send_ebook")]
    [Authorize(Roles = "Admin, Default")]
    public IActionResult SendEbook(SendEbookDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var sendStatus = offerService.SendEbook(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value, dto.OfferId, dto.File).Status;
    
      switch (sendStatus)
      {
        case SendFileStatus.Ok:
          return NoContent();

        case SendFileStatus.OfferIdOrUserInvalid:
          return NotFound();

        case SendFileStatus.FileInvalid:
          return BadRequest();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w edycji przez administratora statusu oferty sprzedaży książki.
    [HttpPut("edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditOfferStatus(int id, [FromBody]OfferStatusEditDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = offerService.EditOfferStatus(id, dto).Status;

      switch (editStatus)
      {
        case BasicEditStatus.Ok:
          return NoContent();

        case BasicEditStatus.BadId:
          return NotFound();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w usunięciu przez administratora oferty sprzedaży książki.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteOffer(int id)
    {
      var deleteStatus = offerService.DeleteOffer(id).Status;

      switch (deleteStatus)
      {
        case BasicDeleteStatus.Ok:
          return NoContent();

        case BasicDeleteStatus.BadId:
          return NotFound();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu użytkownikowi strony listy informacji o złożonych przez niego ofertach sprzedaży książki.
    [HttpGet("my")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult GetMyOffers()
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var orders = offerService.GetMyOffers(username).Content;

      return Ok(orders);
    }

    // Pośredniczy w przekazaniu użytkownikowi strony informacji o konkretnej złożonej przez niego ofercie sprzedaży książki.
    [HttpGet("my/{id}")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult GetMyOfferById(int id)
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var offer = offerService.GetMyOfferById(username, id).Content;

      if (offer == null)
      {
        return NotFound();
      }

      return Ok(offer);
    }

    // Pośredniczy w akcji przewidzenia poprawnej ceny oferowanej książki przez system analityczny.
    [HttpPost("predict_price")]
    [Authorize(Roles = "Admin")]
    public IActionResult AnalizeOffer([FromBody]FormalizedOffer offer)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }
      
      var price = offerService.AnalizeOffer(offer).Content;

      return Ok(price);
    }
  }
}
