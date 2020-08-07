using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Services;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;

namespace LGroszyk.AntiqueBookShop
{
  // Konfiguruje działanie aplikacji i żądań HTTP.
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // Definiuje konfiguracje.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDbContext<AppDbContext>(options => options.UseSqlServer(Configuration["Db"]));

      services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
          options.TokenValidationParameters = new TokenValidationParameters
          {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Configuration["Jwt:Issuer"],
            ValidAudience = Configuration["Jwt:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
          };
        }
      );

      services.AddTransient<IUserService, UserService>();
      services.AddTransient<INewsService, NewsService>();
      services.AddTransient<IBookService, BookService>();
      services.AddTransient<IResourceService, ResourceService>();
      services.AddTransient<IOrderService, OrderService>();
      services.AddTransient<IOfferService, OfferService>();
      services.AddTransient<IPhotoService, PhotoService>();
      services.AddTransient<IEmailService, EmailService>();
      services.AddTransient<IConfigService, ConfigService>();

      services.AddTransient<IPasswordHasher<User>, PasswordHasher<User>>();
      
      services.Configure<MvcOptions>(options =>
      {
        options.Filters.Add(new RequireHttpsAttribute());
      });
      
      services.AddMvc().AddJsonOptions(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
    }

    // Wdraża konfiguracje.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
      app.UseAuthentication();
      app.UseStaticFiles();

      app.UseRewriter(new RewriteOptions().AddRedirectToHttps());

      app.UseMvc(routes =>
      {
        routes.MapRoute("default", "api/{controller}/{action}/{id?}"); 
        routes.MapSpaFallbackRoute("spa-fallback", new { controller = "FrontEnd", action = "Index" });
      });
    }
  }
}
