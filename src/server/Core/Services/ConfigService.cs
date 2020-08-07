
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using System.Linq;
using System;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące informacji o antykwariacie oraz nieaktualnych wpisów w bazie danych
  public class ConfigService : IConfigService
  {
    private readonly AppDbContext context;

    public ConfigService(AppDbContext context)
    {
      this.context = context;
    }

    // Usuwa z bazy danych przedawnione wpisy oraz usuwa z serwera ebooki zakupione przez użytkowników strony wcześniej niż tydzień temu.
    public StatusResult<BasicAddStatus> MaintainDatabase()
    {
      var expiredTokens = context.Tokens
        .Where(x => x.ExpirationDate < DateTime.Now)
        .AsEnumerable();

      var filesSharedMoreThanOneWeekAgo = context.Files
        .Where(x => x.ShareTime.HasValue)
        .Where(x => x.ShareTime.Value.AddDays(7) < DateTime.Now)
        .AsEnumerable();

      foreach (var item in expiredTokens)
      {
        context.Tokens.Remove(item);
      }
      foreach (var item in filesSharedMoreThanOneWeekAgo)
      {
        context.Files.Remove(item);
      }
      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };
    }

    // Przekazuje informacje o antykwariacie.
    public ContentResult<Config> GetConfig()
    {
       var entity = context.Config.Single();

       return new ContentResult<Config>
       {
         Content = entity
       };
    }

    // Edytuje informacje o antykwariacie.
    public StatusResult<BasicEditStatus> SetConfig(Config config)
    {
       var entity = context.Config.Single();

       entity.RulesPl = config.RulesPl;
       entity.RulesEn = config.RulesEn;
       entity.PrivacyPolicyPl = config.PrivacyPolicyPl;
       entity.PrivacyPolicyEn = config.PrivacyPolicyEn;
       entity.ComplaintsPl = config.ComplaintsPl;
       entity.ComplaintsEn = config.ComplaintsEn;
       entity.AboutRulesPl = config.AboutRulesPl;
       entity.AboutRulesEn = config.AboutRulesEn;
       entity.Address = config.Address;
       entity.Timetable = config.Timetable;
       entity.AboutUs = config.AboutUs;

       context.SaveChanges();

       return new StatusResult<BasicEditStatus>
       {
         Status = BasicEditStatus.Ok
       };
    }

    // Przekazuje możliwe wartości właściwości książki używanych w procesie analizy ceny oferty.
    public ContentResult<AnalysisOptionsDto> GetAnalysisOptions()
    {
      var dto = new AnalysisOptionsDto
      {
        AuthorPopularityOptions = new [] { "Nieznany", "Znany", "Znany i bardzo popularny" },
        ConditionOptions = new [] { "Brak (Ebook)", "Zły", "Średni", "Dobry" },
        CategoryOptions = new [] { "Powieść", "Historia", "Dziecięce", "Kobiece", "Biografia", "Podróże", "Popularnonaukowe", "Sztuka", "Poezja", "Inna" },
        LanguageOptions = new [] { "Polski", "Angielski", "Inny" },
        WritingTimeOptions = new [] { "Do 10 lat", "Od 10 do 50 lat", "Od 50 do 100 lat", "Od 100 do 500 lat", "Od 500 lat" },
        PrintingTimeOptions = new [] { "Do 1 roku", "Od 1 do 5 lat", "Od 5 do 10 lat", "Od 10 do 20 lat", "Od 20 do 100 lat", "Od 100 lat" }
      };

      return new ContentResult<AnalysisOptionsDto>
      {
        Content = dto
      };
    }
  }
}