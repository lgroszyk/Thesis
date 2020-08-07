using System;
using System.Collections.Generic;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące aktualności o antykwariacie
  public interface INewsService
  {
    // Przekazuje aktualności.
    ContentResult<IEnumerable<News>> GetNews();

    // Przekazuje aktualności na daną stronę w publicznej części aplikacji.
    ContentResult<IEnumerable<News>> GetNewsForGivenPage(int page);

    // Przekazuje aktualności z konkretnego miesiąca na daną stronę w publicznej części aplikacji.
    ContentResult<IEnumerable<News>> GetNewsForGivenMonthAndPage(string month, int page);

    // Przekazuje informacje o konkretnej aktualności.
    ContentResult<News> GetNewsById(int id);        

    // Przekazuje link do poprzedniej aktualności.
    ContentResult<LinkToNewsDto> GetLinkToPreviousNews(int currentNewsId);

    // Przekazuje link do następnej aktualności.
    ContentResult<LinkToNewsDto> GetLinkToNextNews(int currentNewsId);

    // Przekazuje listę miesięcy, w jakich zostały opublikowane aktualności.
    ContentResult<IEnumerable<string>> GetAllMonthsSinceFirst();

    // Przekazuje liczbę aktualności.
    ContentResult<int> GetNewsCount();

    // Przekazuje liczbę aktualności opublikowanych w konkretnym miesiącu.
    ContentResult<int> GetNewsForGivenMonthCount(string month);
    
    // Dodaje aktualność.
    StatusResult<BasicAddStatus> AddNews(News news);

    // Edytuje aktualność.
    StatusResult<BasicEditStatus> EditNews(int id, News news);

    // Usuwa aktualność.
    StatusResult<BasicDeleteStatus> DeleteNews(int id);

  }
}
