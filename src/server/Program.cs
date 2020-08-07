using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace LGroszyk.AntiqueBookShop
{
  // Punkt główny działania aplikacji.
  public class Program
  {
    // Uruchamia aplikację.
    public static void Main(string[] args)
    {
      BuildWebHost(args).Run();
    }

    // Przygotowuje aplikację do startu.
    public static IWebHost BuildWebHost(string[] args) =>
      WebHost.CreateDefaultBuilder(args)
        .UseStartup<Startup>()
        .Build();
  }
}
