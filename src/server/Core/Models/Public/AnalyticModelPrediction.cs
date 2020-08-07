using Microsoft.ML.Data;

namespace LGroszyk.AntiqueBookShop.Core.Models.Public
{
  // Klasa pomocnicza używana przez system analityczny
  public class AnalyticModelPrediction
  {
    [ColumnName("Score")]
    public float TransactionPrice { get; set; }
  }
}
