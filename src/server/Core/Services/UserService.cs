using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące użytkowników strony
  public class UserService : IUserService
  {
    private readonly AppDbContext context;
    private readonly IPasswordHasher<User> passwordHasher;
    private readonly IConfiguration configuration;
    private readonly IEmailService emailService;

    public UserService(AppDbContext context, IPasswordHasher<User> passwordHasher, 
      IConfiguration configuration, IEmailService emailService)
    {
      this.context = context;
      this.passwordHasher = passwordHasher;
      this.configuration = configuration;
      this.emailService = emailService;
    }

    // Przekazuje dane użytkowników do panelu administracyjnego strony.
    public ContentResult<IEnumerable<UserInfoDto>> GetAllUsers()
    {
      var users = context.Users
        .Select(x => new UserInfoDto
      {
        Id = x.Id,
        Name = x.Name,
        Email = x.Email        
      });

      return new ContentResult<IEnumerable<UserInfoDto>>
      {
        Content = users
      };
    }

    // Przekazuje dane konkretnego użytkownika do panelu administracyjnego strony.
    public ContentResult<UserInfoDto> GetUserById(int id)
    {
      var user = context.Users
        .Include(x => x.UserRoles)
          .ThenInclude(x => x.Role)
        .Include(x => x.Orders)
        .Include(x => x.Offers)
        .Include(x => x.Files)
        .SingleOrDefault(x => x.Id == id);

      if (user == null)
      {
        return new ContentResult<UserInfoDto>
        {
          Content = null
        };
      }

      var dto = new UserInfoDto
      {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        IsAdmin = user.UserRoles.Any(x => x.Role.Name == "Admin"),
        OrdersNumbers = user.Orders.Select(x => x.Id.ToString()),
        OffersNumbers = user.Offers.Select(x => x.Id.ToString()),
        FilesNumbers = user.Files.Select(x => x.Id.ToString()),
      };

      return new ContentResult<UserInfoDto>
      {
        Content = dto
      };
    }

    // Loguje na konto użytkownika.
    public FullResult<string, LoginStatus> LogIn(string username, string password)
    {
      var user = context.Users
        .Include(x => x.UserRoles)
        .ThenInclude(x => x.Role)
        .SingleOrDefault(x => x.Name == username);

      if (user == null)
      {
        return new FullResult<string, LoginStatus>
        { 
          Content = null, 
          Status = LoginStatus.BadCredentials, 
        };
      }

      if (!user.EmailConfirmed)
      {
        return new FullResult<string, LoginStatus>
        { 
          Content = null, 
          Status = LoginStatus.EmailNotConfirmed, 
        };
      }
      
      var passwordVerificationResult = new PasswordHasher<User>()
        .VerifyHashedPassword(null, user.PasswordHash, password);
      if (passwordVerificationResult == PasswordVerificationResult.Failed)
      {
        return new FullResult<string, LoginStatus>
        { 
          Content = null, 
          Status = LoginStatus.BadCredentials, 
        };
      }

      var roles = user.UserRoles.Select(x => x.Role);
      var jwt = CreateJwt(user.Name, roles);

      return new FullResult<string, LoginStatus>
      {
        Content = jwt,
        Status = LoginStatus.LoggedIn,
      };
    }

    // Rejestruje nowe konto użytkownika.
    public StatusResult<RegisterStatus> Register(RegisterDto user, IEnumerable<string> roleTypes)
    {
      var usernameIsUnique = context.Users.SingleOrDefault(x => x.Name == user.UserName) == null;
      if (!usernameIsUnique)
      {
        return new StatusResult<RegisterStatus>
        {
          Status = RegisterStatus.UsernameNotUnique,
        };
      }

      var emailIsUnique = context.Users.SingleOrDefault(x => x.Email == user.Email) == null;
      if (!emailIsUnique)
      {
        return new StatusResult<RegisterStatus>
        {
          Status = RegisterStatus.EmailNotUnique,
        };
      }

      var userEntity = new User();
      var passwordHash = passwordHasher.HashPassword(userEntity, user.Password);

      userEntity.Name = user.UserName;
      userEntity.PasswordHash = passwordHash;
      userEntity.Email = user.Email;

      context.Users.Add(userEntity);

      foreach (var roleType in roleTypes)
      {
        var roleId = context.Roles.SingleOrDefault(x => x.Name == roleType)?.Id;
        if (roleId.HasValue)
        {
          var userRole = new UserRole { UserId = userEntity.Id, RoleId = roleId.Value };
          context.UsersRoles.Add(userRole);
        }
      }

      var token = new Token
      {
        Name = "AccountConfirmation",
        Value = GenerateToken(),
        UserId = userEntity.Id,
        ExpirationDate = DateTime.Now.AddMinutes(10)
      };
      context.Tokens.Add(token);
      
      context.SaveChanges();

      emailService.SendConfirmationEmail(userEntity.Name, userEntity.Email, token.Value);

      return new StatusResult<RegisterStatus>
      {
        Status = RegisterStatus.Registered,
      };
    }

    // Potwierdza adres email podany podczas rejestracji użytkownika.
    public StatusResult<ConfirmAccountStatus> ConfirmAccount(string confirmationToken)
    {
      var token = context.Tokens
        .Include(x => x.User)
        .SingleOrDefault(x => x.Value == confirmationToken);

      if (token == null)
      {
        return new StatusResult<ConfirmAccountStatus>
        {
          Status = ConfirmAccountStatus.TokenNotFound
        };        
      }

      if (DateTime.Now > token.ExpirationDate)
      {
        context.Users.Remove(token.User);
        context.SaveChanges();
        
        return new StatusResult<ConfirmAccountStatus>
        {
          Status = ConfirmAccountStatus.TokenExpired
        };     
      }

      token.User.EmailConfirmed = true;
      context.Tokens.Remove(token);

      context.SaveChanges();

      return new StatusResult<ConfirmAccountStatus>
      {
        Status = ConfirmAccountStatus.Ok
      };
    }

    // Usuwa konta użytkownika na żądanie administratora.
    public StatusResult<BasicDeleteStatus> DeleteUser(int id)
    {
      var toDelete = context.Users
        .Include(x => x.Tokens)
        .Include(x => x.UserRoles)
        .Include(x => x.Files)
        .Include(x => x.Orders)
        .Include(x => x.Offers)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      foreach (var item in toDelete.Tokens)
      {
        context.Tokens.Remove(item);
      }
      foreach (var item in toDelete.UserRoles)
      {
        context.UsersRoles.Remove(item);
      }
      foreach (var item in toDelete.Files)
      {
        item.UserId = null;
      }
      foreach (var item in toDelete.Orders)
      {
        item.UserId = null;
      }
      foreach (var item in toDelete.Offers)
      {
        item.UserId = null;
      }

      context.Users.Remove(toDelete);
      context.SaveChanges();

      emailService.SendAccountDeleteEmail(toDelete.Email);

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Usuwa własne konto użytkownika.
    public StatusResult<BasicDeleteStatus> DeleteMe(string username)
    {
      var toDelete = context.Users
        .Include(x => x.Tokens)
        .Include(x => x.UserRoles)
        .Include(x => x.Files)
        .Include(x => x.Orders)
        .Include(x => x.Offers)
        .SingleOrDefault(x => x.Name == username);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      foreach (var item in toDelete.Tokens)
      {
        context.Tokens.Remove(item);
      }
      foreach (var item in toDelete.UserRoles)
      {
        context.UsersRoles.Remove(item);
      }
      foreach (var item in toDelete.Files)
      {
        item.UserId = null;
      }
      foreach (var item in toDelete.Orders)
      {
        item.UserId = null;
      }
      foreach (var item in toDelete.Offers)
      {
        item.UserId = null;
      }

      context.Users.Remove(toDelete);
      context.SaveChanges();

      emailService.SendAccountDeleteEmail(toDelete.Email);

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };

    }

    // Zmienia hasło użytkownika.
    public StatusResult<ChangePasswordStatus> ChangePassword(string username, ChangePasswordDto dto)
    {
      var user = context.Users
        .Single(x => x.Name == username);

      var isOldPasswordCorrect = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword) == PasswordVerificationResult.Success;

      if (!isOldPasswordCorrect)
      {
        return new StatusResult<ChangePasswordStatus>
        {
          Status = ChangePasswordStatus.BadPassword
        };
      }

      user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
      context.SaveChanges();

      return new StatusResult<ChangePasswordStatus>
      {
        Status = ChangePasswordStatus.Ok
      };
    }

    // Przekazuje adres email aktualnie zalogowanego użytkownika.
    public ContentResult<string> GetMyEmail(string username)
    {
      var email = context.Users
        .Single(x => x.Name == username)
        .Email;

      return new ContentResult<string>
      {
        Content = email
      };
    }

    // Metoda pomocnicza generująca token do potwierdzenia adresu email podanego podczas rejestracji
    private string GenerateToken()
    {
      using(var rng = new System.Security.Cryptography.RNGCryptoServiceProvider())
      {
        var tokenLength = 64;
        var tokenData = new byte[tokenLength];
        rng.GetBytes(tokenData);
        var token = System.Convert.ToBase64String(tokenData);
        token = token.Replace('/', 'a');
        token = token.Replace('+', 'a');
        return token;
      }
    }

    // Metoda pomocnicza generująca JSON Web Token podczas logowania na konto użytkownika
    private string CreateJwt(string username, IEnumerable<Role> roles)
    {
      var issuer = configuration["Jwt:Issuer"];
      var audience = issuer;
      var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);
      var expirationDate = DateTime.Now.AddMinutes(60*24);
      var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>();
      claims.Add(new Claim(JwtRegisteredClaimNames.Sub, username));
      claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
      foreach (var role in roles)
      {
        claims.Add(new Claim("roles", role.Name));
      }

      var jwt = new JwtSecurityToken(issuer, audience, claims, null, expirationDate, signingCredentials);
      return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
  }
}
