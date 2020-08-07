namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Klasa pomocnicza reprezentująca wynik operacji dokonywanych w warstwie biznesowej oraz zawartość zwróconą przez te operacje
  public class FullResult<TContent, TStatus>
  {
    public TContent Content { get; set; }
    public TStatus Status { get; set; }
  }

  // Klasa pomocnicza reprezentująca wynik operacji dokonywanych w warstwie biznesowej 
  public class StatusResult<TStatus>
  {
    public TStatus Status { get; set; }
  }

  // Klasa pomocnicza reprezentująca zawartość zwróconą przez operacje dokonywane w warstwie biznesowej
  public class ContentResult<TContent>
  {
    public TContent Content { get; set; }
  }
}
