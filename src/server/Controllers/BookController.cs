using System.Linq;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using Microsoft.AspNetCore.Hosting;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących książek z oferty antykwariatu
  [Route("api/books")]
  [Authorize]
  public class BookController : Controller
  {
    private readonly IHostingEnvironment hostingEnvironment;
    private readonly IBookService bookService;

    public BookController(IBookService bookService, IHostingEnvironment hostingEnvironment)
    {
      this.bookService = bookService;
      this.hostingEnvironment = hostingEnvironment;
    }

    // Pośredniczy w przekazaniu książek z oferty na daną stronę w publicznej części aplikacji.
    [HttpPost]
    [AllowAnonymous]
    public IActionResult GetBooksForGivenPage([FromBody]BooksFilterDto filter)
    {       
      if (!ModelState.IsValid)
      {
        return BadRequest();
      } 

      var filteringResult = bookService.GetBooksForGivenPage(filter).Content;

      return Ok(filteringResult);
    }

    // Pośredniczy w przekazaniu książek z oferty na daną stronę w panelu administracyjnym.
    [HttpPost("all")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllBooksForGivenPage([FromBody]BooksFilterDto filter)
    {       
      if (!ModelState.IsValid)
      {
        return BadRequest();
      } 

      var filteringResult = bookService.GetAllBooksForGivenPage(filter).Content;

      return Ok(filteringResult);
    }

    // Pośredniczy w przekazaniu danych o autorach książek z oferty.
    [HttpGet("authors")]
    [AllowAnonymous]
    public IActionResult GetAllAuthors()
    {
      var authors = bookService.GetAllAuthors().Content;

      return Ok(authors);
    }

    // Pośredniczy w przekazaniu danych o kategoriach książek z oferty.
    [HttpGet("categories")]
    [AllowAnonymous]
    public IActionResult GetAllCategories()
    {
      var categories = bookService.GetAllCategories().Content;

      return Ok(categories);
    }

    // Pośredniczy w przekazaniu danych o językach książek z oferty.
    [HttpGet("languages")]
    [AllowAnonymous]
    public IActionResult GetAllLanguages()
    {
      var kinds = bookService.GetAllLanguages().Content;

      return Ok(kinds);
    }

    // Pośredniczy w przekazaniu informacji o konkretnej kategorii książek.
    [HttpGet("category/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetCategoryById(int id)
    {
      var category = bookService.GetCategoryById(id).Content;

      if (category == null)
      {
        return NotFound();
      }

      return Ok(category);
    }

    // Pośredniczy w akcji dodania kategorii książek.
    [HttpPost("category/add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddCategory([FromBody]Category category)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.AddCategory(category).Status;

      switch (operationResult)
      {
        case BasicAddStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji edycji kategorii książek.
    [HttpPut("category/edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditCategory(int id, [FromBody]Category category)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.EditCategory(id, category).Status;

      switch (operationResult)
      {
        case BasicEditStatus.Ok:
          return NoContent();

        case BasicEditStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji usunięcia kategorii książek.
    [HttpDelete("category/delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteCategory(int id)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.DeleteCategory(id).Status;

      switch (operationResult)
      {
        case BasicDeleteStatus.Ok:
          return NoContent();

        case BasicDeleteStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu informacji o konkretnym języku książek.
    [HttpGet("language/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetLanguageById(int id)
    {
      var language = bookService.GetLanguageById(id).Content;

      if (language == null)
      {
        return NotFound();
      }

      return Ok(language);
    }

    // Pośredniczy w akcji dodania języka książek.
    [HttpPost("language/add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddLanguage([FromBody]Language language)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.AddLanguage(language).Status;

      switch (operationResult)
      {
        case BasicAddStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji edycji języka książek.
    [HttpPut("language/edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditLanguage(int id, [FromBody]Language language)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.EditLanguage(id, language).Status;

      switch (operationResult)
      {
        case BasicEditStatus.Ok:
          return NoContent();

        case BasicEditStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji usunięcia języka książek.
    [HttpDelete("language/delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteLanguage(int id)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.DeleteLanguage(id).Status;

      switch (operationResult)
      {
        case BasicDeleteStatus.Ok:
          return NoContent();

        case BasicDeleteStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu informacji o konkretnym autorze książek.
    [HttpGet("author/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAuthorById(int id)
    {
      var author = bookService.GetAuthorById(id).Content;

      if (author == null)
      {
        return NotFound();
      }

      return Ok(author);
    }

    // Pośredniczy w akcji dodania autora książek.
    [HttpPost("author/add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddAuthor([FromBody]Author author)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.AddAuthor(author).Status;

      switch (operationResult)
      {
        case BasicAddStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji edycji autora książek.
    [HttpPut("author/edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditAuthor(int id, [FromBody]Author author)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.EditAuthor(id, author).Status;

      switch (operationResult)
      {
        case BasicEditStatus.Ok:
          return NoContent();

        case BasicEditStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji usunięcia autora książek.
    [HttpDelete("author/delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteAuthor(int id)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var operationResult = bookService.DeleteAuthor(id).Status;

      switch (operationResult)
      {
        case BasicDeleteStatus.Ok:
          return NoContent();

        case BasicDeleteStatus.BadId:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu informacji o konkretnej książce.
    [HttpGet("{id}")]
    [AllowAnonymous]
    public IActionResult GetBookById(int id)
    {
      var book = bookService.GetBookById(id).Content;

      if (book == null)
      {
        return NotFound();
      }

      return Ok(book);
    }

    // Pośredniczy w akcji edycji książki.
    [HttpPut("edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditBook(int id, [FromBody]Book book)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = bookService.EditBook(id, book).Status;

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

    // Pośredniczy w akcji usunięcia książki.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteBook(int id)
    {
      var deleteStatus = bookService.DeleteBook(id).Status;

      switch(deleteStatus)
      {
        case BasicDeleteStatus.BadId:
          return NotFound();
        
        case BasicDeleteStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji dodania książki.
    [HttpPost("add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddBook([FromBody]Book book)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var addStatus = bookService.AddBook(book).Status;

      switch(addStatus)
      {
        case BasicAddStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }


    // Pośredniczy w przekazaniu listy danych ebooków zakupionych przez użytkownika strony.
    [HttpGet("my/ebooks")]
    [Authorize(Roles = "Admin, Default")]
    public IActionResult GetMyEbooks()
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var ebooks = bookService.GetMyEbooks(username).Content;
 
      return Ok(ebooks);
    }

    // Pośredniczy w przekazaniu informacji o ebooku zakupionym przez użytkownika strony.
    [HttpGet("my/ebook/{id}")]
    [Authorize(Roles = "Admin, Default")]
    public IActionResult GetMyEbookById(int id)
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var ebook = bookService.GetMyEbookById(username, id).Content;

      if (ebook == null)
      {
        return NotFound();
      }

      return Ok(ebook);
    }

    // Pośredniczy w akcji wgrania ebooka na serwer przez administratora strony.
    [HttpPost("file/add")]
    [Authorize(Roles = "Admin")]
    public IActionResult AddEbook(SendFileDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var addStatus = bookService.AddFile(dto).Status;

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

    // Pośredniczy w akcji edycji nazwy pliku ebooka znajdującego się na serwerze.
    [HttpPut("file/edit_filename/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditFileName(int id, [FromBody]FileNameDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = bookService.EditFileName(id, dto).Status;

      switch (editStatus)
      {
        case EditFileNameStatus.BadId:
          return NotFound();

        case EditFileNameStatus.Conflict:
          return StatusCode(409);

        case EditFileNameStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji edycji właściciela ebooka znajdującego się na serwerze.
    [HttpPut("file/edit_username/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditUserName(int id, [FromBody]FileOwnerNameDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = bookService.EditFileOwnerName(id, dto).Status;

      switch (editStatus)
      {
        case EditFileOwnerNameStatus.BadId:
        case EditFileOwnerNameStatus.UserNotFound:
          return NotFound();

        case EditFileOwnerNameStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w akcji usunięcia pliku ebooka z serwera.
    [HttpDelete("file/delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteFile(int id)
    {
      var deleteStatus = bookService.DeleteFile(id).Status;

      switch (deleteStatus)
      {
        case FileRemoveStatus.BadId:
          return NotFound();

        case FileRemoveStatus.Ok:
          return NoContent();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu administratorowi strony informacji o ebooku znajdującym się na serwerze.
    [HttpGet("file/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetFileById(int id)
    {
      var file = bookService.GetFileInfoById(id).Content;

      if (file == null)
      {
        return NotFound();
      }

      return Ok(file);
    }

    // Pośredniczy w przekazaniu administratorowi strony listy danych ebooków znajdujących się na serwerze.
    [HttpGet("files")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllFiles()
    {
      var files = bookService.GetAllFiles().Content;

      return Ok(files);
    }

    // Pośredniczy w akcji pobrania ebooka zakupionego przez użytkownika strony.
    [HttpGet("my/ebook/download/{id}")]
    [Authorize(Roles = "Admin, Default")]
    public IActionResult DownloadMyEbookById(int id)
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var ebook = bookService.DownloadMyEbookById(username, id).Content;

      if (ebook == null)
      {
        return NotFound();
      }

      return PhysicalFile(hostingEnvironment.ContentRootPath + "\\private_static\\files\\" + ebook.Name, ebook.Type, ebook.Name);
    }

    // Pośredniczy w akcji pobrania ebooka znajdującego się na serwerze przez administratora.    
    [HttpGet("files/download/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DownloadFileById(int id)
    {
      var ebook = bookService.DownloadFileById(id).Content;

      if (ebook == null)
      {
        return NotFound();
      }

      return PhysicalFile(hostingEnvironment.ContentRootPath + "\\private_static\\files\\" + ebook.Name, ebook.Type, ebook.Name);
    }
  }
}
