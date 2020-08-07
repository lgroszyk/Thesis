using System.Linq;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Models.Public;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących aktualności o antykwariacie
  [Route("api/news")]
  [Authorize]
  public class NewsController : Controller
  {
    private readonly INewsService newsService;
    private readonly TextEncoder urlEncoder;

    public NewsController(INewsService newsService)
    {
      this.newsService = newsService;
      this.urlEncoder = UrlEncoder.Default;
    }

    // Pośredniczy w przekazaniu aktualności.
    [HttpGet("")]
    [AllowAnonymous]
    public IActionResult GetNews()
    {
      var news = newsService.GetNews().Content;

      return Ok(news);
    }

    // Pośredniczy w przekazaniu aktualności na daną stronę w publicznej części aplikacji.
    [HttpGet("page/{page}")]
    [AllowAnonymous]
    public IActionResult GetNewsForGivenPage(int page)
    {
      var news = newsService.GetNewsForGivenPage(page).Content;

      if (news.Count() > 0) 
      {
        return Ok(news);
      }

      return NotFound();
    }

    // Pośredniczy w przekazaniu liczby aktualności.
    [HttpGet("count")]
    [AllowAnonymous]
    public IActionResult GetNewsCount()
    {
      var count = newsService.GetNewsCount().Content;

      return Ok(count);
    }

    // Pośredniczy w przekazaniu liczby aktualności opublikowanych w konkretnym miesiącu.
    [HttpGet("{month}/count")]
    [AllowAnonymous]
    public IActionResult GetNewsForGivenMonthCount(string month)
    {
      month = urlEncoder.Encode(month);

      var count = newsService.GetNewsForGivenMonthCount(month).Content;

      return Ok(count);
    }

    // Pośredniczy w przekazaniu aktualności z konkretnego miesiąca na daną stronę w publicznej części aplikacji.
    [HttpGet("{month}/page/{page}")]
    [AllowAnonymous]
    public IActionResult GetNewsForGivenMonthAndPage(string month, int page)
    {
      month = urlEncoder.Encode(month);
      
      var news = newsService.GetNewsForGivenMonthAndPage(month, page).Content;

      if (news.Count() > 0) 
      {
        return Ok(news);
      }

      return NotFound();
    }

    // Pośredniczy w przekazaniu informacji o konkretnej aktualności.
    [HttpGet("{id}")]
    [AllowAnonymous]
    public IActionResult GetNewsById(int id)
    {
      var news = newsService.GetNewsById(id).Content;

      if (news == null) 
      {
        return NotFound();    
      }

      return Ok(news);  
    }

    // Pośredniczy w przekazaniu linku do poprzedniej aktualności.
    [HttpGet("previous/{id}")]
    [AllowAnonymous]
    public IActionResult GetLinkToPreviousNews(int id)
    {
      var news = newsService.GetLinkToPreviousNews(id).Content;

      if (news == null)
      {
        return NotFound();
      }

      return Ok(news);
    }
    
    // Pośredniczy w przekazaniu linku do następnej aktualności.
    [HttpGet("next/{id}")]
    [AllowAnonymous]
    public IActionResult GetLinkToNextNews(int id)
    {
      var news = newsService.GetLinkToNextNews(id).Content;

      if (news == null)
      {
        return NotFound();
      }

      return Ok(news);
    }

    // Pośredniczy w przekazaniu listy miesięcy, w jakich zostały opublikowane aktualności.
    [HttpGet("months")]
    [AllowAnonymous]
    public IActionResult GetAllMonthsSinceFirst()
    {
      var months = newsService.GetAllMonthsSinceFirst().Content;

      return Ok(months);
    }

    // Pośredniczy w akcji dodania aktualności.
    [HttpPost("add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddNews([FromBody]News news)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var addStatus = newsService.AddNews(news).Status;

      switch(addStatus)
      {
        case BasicAddStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji edycji aktualności.
    [HttpPut("edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditNews(int id, [FromBody]News news)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = newsService.EditNews(id, news).Status;

      switch(editStatus)
      {
        case BasicEditStatus.BadId:
          return NotFound();
        
        case BasicEditStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji usunięcia aktualności.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteNews(int id)
    {
      var editStatus = newsService.DeleteNews(id).Status;

      switch(editStatus)
      {
        case BasicDeleteStatus.BadId:
          return NotFound();
        
        case BasicDeleteStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }
  }
}
