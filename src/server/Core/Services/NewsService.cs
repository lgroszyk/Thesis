using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using System;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące aktualności o antykwariacie
  public class NewsService : INewsService
  {
    private readonly AppDbContext context;

    public NewsService(AppDbContext context)
    {
      this.context = context;
    }

    // Przekazuje listę miesięcy, w jakich zostały opublikowane aktualności.
    public ContentResult<IEnumerable<string>> GetAllMonthsSinceFirst()
    {
      var months = context.News
        .Select(x => x.Date)
        .GroupBy(x => x.Month)
        .Select(x => (x.First().Month < 10 ? "0" + x.First().Month.ToString() : x.First().Month.ToString()) 
          + "-" + x.First().Year.ToString());
        
      return new ContentResult<IEnumerable<string>>
      {
        Content = months
      };
    }

    // Przekazuje link do następnej aktualności.
    public ContentResult<LinkToNewsDto> GetLinkToNextNews(int currentNewsId)
    {
      var currentNews = this.GetNewsById(currentNewsId).Content;

      if (currentNews == null)
      {
        return new ContentResult<LinkToNewsDto>
        {
          Content = null
        };
      }

      var newsYoungerThanCurrent = context.News
        .Where(x => x.Date > currentNews.Date);

      if (newsYoungerThanCurrent.Count() == 0)
      {
        return new ContentResult<LinkToNewsDto>
        {
          Content = null
        };  
      }      

      var nextNews = newsYoungerThanCurrent.OrderBy(x => x.Date).First();
      var dto = new LinkToNewsDto
      {
        Id = nextNews.Id,
        Title = nextNews.Title
      };

      return new ContentResult<LinkToNewsDto>
      {
        Content = dto
      };
    }

    // Przekazuje link do poprzedniej aktualności.
    public ContentResult<LinkToNewsDto> GetLinkToPreviousNews(int currentNewsId)
    {
      var currentNews = this.GetNewsById(currentNewsId).Content;

      if (currentNews == null)
      {
        return new ContentResult<LinkToNewsDto>
        {
          Content = null
        };
      }

      var newsOlderThanCurrent = context.News
        .Where(x => x.Date < currentNews.Date)
        .OrderByDescending(x => x.Date);

      if (newsOlderThanCurrent.Count() == 0)
      {
        return new ContentResult<LinkToNewsDto>
        {
          Content = null
        };
      }      

      var nextNews = newsOlderThanCurrent.First();
      var dto = new LinkToNewsDto
      {
        Id = nextNews.Id,
        Title = nextNews.Title
      };

      return new ContentResult<LinkToNewsDto>
      {
        Content = dto
      };
    }

    // Przekazuje aktualności.
    public ContentResult<IEnumerable<News>> GetNews()
    {
      var news = context.News
        .Include(x => x.NewsPhotos)
          .ThenInclude(x => x.Photo)
        .OrderByDescending(x => x.Date);

      return new ContentResult<IEnumerable<News>>
      {
        Content = news,
      };
    }

    // Przekazuje aktualności na daną stronę w publicznej części aplikacji.
    public ContentResult<IEnumerable<News>> GetNewsForGivenPage(int page)
    {
      var newsPerPage = 10;
      var news = context.News
        .Include(x => x.NewsPhotos)
          .ThenInclude(x => x.Photo)
        .OrderByDescending(x => x.Date)
        .Skip(newsPerPage * (page - 1))
        .Take(newsPerPage);

      return new ContentResult<IEnumerable<News>>
      {
        Content = news,
      };
    }

    // Przekazuje aktualności z konkretnego miesiąca na daną stronę w publicznej części aplikacji.
    public ContentResult<IEnumerable<News>> GetNewsForGivenMonthAndPage(string month, int page)
    {
      var isMonthCorrect = int.TryParse(month.Substring(0, 2), out int monthOfTheNews);
      var isYearCorrect = int.TryParse(month.Substring(3, 4), out int yearOfTheNews);

      if (!isMonthCorrect || !isYearCorrect)
      {
        return new ContentResult<IEnumerable<News>>
        {
          Content = Enumerable.Empty<News>(),
        };          
      }

      var newsPerPage = 10;
      var news = context.News
        .Include(x => x.NewsPhotos)
          .ThenInclude(x => x.Photo)
        .OrderByDescending(x => x.Date)
        .Where(x => x.Date.Month == monthOfTheNews && x.Date.Year == yearOfTheNews )
        .Skip(newsPerPage * (page - 1))
        .Take(newsPerPage);

      return new ContentResult<IEnumerable<News>>
      {
        Content = news,
      };
    }

    // Przekazuje informacje o konkretnej aktualności.
    public ContentResult<News> GetNewsById(int id)
    {
      var news = context.News
        .Include(x => x.NewsPhotos)
          .ThenInclude(x => x.Photo)
        .OrderByDescending(x => x.Date)
        .SingleOrDefault(x => x.Id == id);

      return new ContentResult<News>
      {
        Content = news
      };
    }

    // Przekazuje liczbę aktualności.
    public ContentResult<int> GetNewsCount()
    {
      var count = context.News.Count();

      return new ContentResult<int>
      {
        Content = count
      };
    }

    // Przekazuje liczbę aktualności opublikowanych w konkretnym miesiącu.
    public ContentResult<int> GetNewsForGivenMonthCount(string month)
    {
      var isMonthCorrect = int.TryParse(month.Substring(0, 2), out int monthOfTheNews);
      var isYearCorrect = int.TryParse(month.Substring(3, 4), out int yearOfTheNews);

      if (!isMonthCorrect || !isYearCorrect)
      {
        return new ContentResult<int>
        {
          Content = 0
        };          
      }

      var count = context.News
        .Where(x => x.Date.Month == monthOfTheNews && x.Date.Year == yearOfTheNews )
        .Count();

      return new ContentResult<int>
      {
        Content = count
      };
    }

    // Dodaje aktualność.
    public StatusResult<BasicAddStatus> AddNews(News news)
    {
      var toAdd = new News
      {
        Title = news.Title,
        Content = news.Content,
        Description = news.Description,
        Date = news.Date,
        PublisherName = news.PublisherName
      };

      context.News.Add(toAdd);

      foreach (var item in news.NewsPhotos)
      {
        context.NewsPhotos.Add(new NewsPhoto
        {
          NewsId = toAdd.Id,
          PhotoId = item.PhotoId,
          IsMainPhoto = item.IsMainPhoto
        });
      }

      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };
    }

    // Edytuje aktualność.
    public StatusResult<BasicEditStatus> EditNews(int id, News news)
    {
      var toEdit = context.News.SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.Title = news.Title;
      toEdit.Description = news.Description;
      toEdit.Content = news.Content;

      var oldItems = context.NewsPhotos.Where(x => x.NewsId == id).ToArray();
      for (int i = oldItems.Length - 1; i >= 0 ; i--)
      {
        context.NewsPhotos.Remove(oldItems[i]);
      }
      var newItems = news.NewsPhotos;
      foreach (var item in newItems)
      {
        context.NewsPhotos.Add(item);
      }

      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };

    }

    // Usuwa aktualność.
    public StatusResult<BasicDeleteStatus> DeleteNews(int id)
    {
      var toDelete = context.News
        .Include(x => x.NewsPhotos)
          .ThenInclude(x => x.Photo)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      foreach (var item in toDelete.NewsPhotos)
      {
        context.NewsPhotos.Remove(item);
      }

      context.News.Remove(toDelete);

      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }
  }
}
