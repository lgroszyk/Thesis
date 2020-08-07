using Microsoft.ML.Data;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Klasa pomocnicza używana przez system analityczny
  public class AnalyticModel
  {
      [LoadColumn(0)]
      public string AuthorPopularity;

      [LoadColumn(1)]
      public string Condition;

      [LoadColumn(2)]
      public string Category;
      
      [LoadColumn(3)]
      public string Language;
      
      [LoadColumn(4)]
      public bool IsEbook;
      
      [LoadColumn(5)]
      public string WritingTime;
      
      [LoadColumn(6)]
      public string PrintingTime;
      
      [LoadColumn(7)]
      public float TransactionPrice;
  }
}
