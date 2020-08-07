using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Services.Public;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących użytkowników strony
  [Route("api/user")]
  [Authorize]
  public class UserController : Controller
  {
    private readonly IUserService userService;

    public UserController(IUserService userService)
    {
      this.userService = userService;
    }

    // Pośredniczy w przekazaniu danych użytkowników do panelu administracyjnego strony.
    [HttpGet("")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllUsers()
    {
      var users = userService.GetAllUsers().Content;

      return Ok(users);
    }

    // Pośredniczy w przekazaniu danych konkretnego użytkownika do panelu administracyjnego strony.
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetUserById(int id)
    {
      var users = userService.GetUserById(id).Content;

      return Ok(users);
    }

    // Pośredniczy w logowaniu na konto użytkownika.
    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult LogIn([FromBody]LoginDto login)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }      

      var loginResult = userService.LogIn(login.UserName, login.Password);

      switch (loginResult.Status)
      {
        case LoginStatus.LoggedIn: 
          return Ok(loginResult.Content);

        case LoginStatus.EmailNotConfirmed:
          return Forbid();

        case LoginStatus.BadCredentials:
        default: 
          return Unauthorized();
      }   
    }

    // Pośredniczy w rejestracji nowego konta użytkownika.
    [HttpPost("register")]
    [AllowAnonymous]
    public IActionResult Register([FromBody]RegisterDto register)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var registerResult = userService.Register(register, new [] { "Default" }).Status;

      switch (registerResult)
      {
        case RegisterStatus.Registered:
          return NoContent();

        case RegisterStatus.EmailNotUnique:
        case RegisterStatus.UsernameNotUnique:
          return StatusCode(409);

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w rejestracji nowego konta administratora.
    [HttpPost("register_admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult RegisterAdmin([FromBody]RegisterDto register)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var registerResult = userService.Register(register, new [] { "Default", "Admin" }).Status;

      switch (registerResult)
      {
        case RegisterStatus.Registered:
          return NoContent();

        case RegisterStatus.EmailNotUnique:
        case RegisterStatus.UsernameNotUnique:
          return StatusCode(409);

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w przekazaniu adresu email aktualnie zalogowanego użytkownika.
    [HttpGet("my/email")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult GetMyEmail()
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;
      
      var email = userService.GetMyEmail(username).Content;

      return Ok(new { Email = email });
    }


    // Pośredniczy w potwierdzeniu adresu email podanego podczas rejestracji użytkownika.
    [HttpPost("confirm")]
    [AllowAnonymous]
    public IActionResult Confirm([FromBody]AccountConfirmationDto confirmationData)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var confirmationStatus = userService.ConfirmAccount(confirmationData.Token).Status;

      switch (confirmationStatus)
      {
        case ConfirmAccountStatus.Ok:
          return NoContent();

        case ConfirmAccountStatus.TokenNotFound:
          return NotFound();

        case ConfirmAccountStatus.TokenExpired:
          return StatusCode(409);
          
        default:
          return StatusCode(500);
      }
    }


    // Pośredniczy w usunięciu konta użytkownika na żądanie administratora.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteUser(int id)
    {
      var deleteStatus = userService.DeleteUser(id).Status;

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

    // Pośredniczy w usunięciu własnego konta użytkownika.
    [HttpDelete("delete/me")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult DeleteUser()
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var deleteStatus = userService.DeleteMe(username).Status;

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

    // Pośredniczy w zmianie hasła użytkownika.
    [HttpPost("change_password")]
    [Authorize(Roles = "Admin, Default")]
    public IActionResult ChangePassword([FromBody]ChangePasswordDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var changePasswordResult = userService.ChangePassword(username, dto).Status;

      switch (changePasswordResult)
      {
        case ChangePasswordStatus.Ok:
          return NoContent();

        case ChangePasswordStatus.BadPassword:
          return NotFound();

        default: 
          return StatusCode(500);
      }
    }
  }
}
