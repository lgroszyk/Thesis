using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących zdjęć znajdujących się na serwerze
  [Route("api/photos")]
  [Authorize]
  public class PhotoController : Controller
  {
    private readonly IPhotoService photoService;

    public PhotoController(IPhotoService photoService)
    {
      this.photoService = photoService;
    }

    // Pośredniczy w przekazaniu danych dotyczących zdjęć znajdujących się na serwerze.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllPhotos()
    {
      var photos = photoService.GetAllPhotos().Content;

      return Ok(photos);
    }

    // Pośredniczy we wgraniu na serwer zdjęcia przez administratora.
    [HttpPost("add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddPhoto(SendFileDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var addStatus = photoService.AddPhoto(dto).Status;

      switch (addStatus)
      {
        case SendFileStatus.FileInvalid:
          return BadRequest();

        case SendFileStatus.Ok:
          return NoContent();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w edycji przez administratora nazwy pliku ze zdjęciem.
    [HttpPut("edit_photoname/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditPhotoName(int id, [FromBody]PhotoNameDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = photoService.EditPhotoName(id, dto).Status;

      switch (editStatus)
      {
        case EditPhotoNameStatus.BadId:
          return NotFound();

        case EditPhotoNameStatus.Conflict:
          return StatusCode(409);

        case EditPhotoNameStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w usunięciu zdjęcia z serwera przez administratora.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeletePhoto(int id)
    {
      var deleteStatus = photoService.DeletePhoto(id).Status;

      switch (deleteStatus)
      {
        case PhotoRemoveStatus.BadId:
          return NotFound();

        case PhotoRemoveStatus.IsMainPhoto:
          return StatusCode(409);

        case PhotoRemoveStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }

    }
  }
}
