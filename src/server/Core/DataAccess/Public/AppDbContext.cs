using Microsoft.EntityFrameworkCore;
using LGroszyk.AntiqueBookShop.Core.Models.Public;

namespace LGroszyk.AntiqueBookShop.Core.DataAccess.Public
{
  // Klasa reprezentująca bazę danych aplikacji i jej poszczególne tabele
  public class AppDbContext : DbContext
  {
    public DbSet<Order> Orders { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<OfferResponse> OfferResponses { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<News> News { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Config> Config { get; set; }

    public DbSet<OrderStatus> OrderStatuses { get; set; }
    public DbSet<OfferStatus> OfferStatuses { get; set; }
    public DbSet<OfferResponseStatus> OfferResponseStatuses { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Token> Tokens { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<File> Files { get; set; }
    
    public DbSet<UserRole> UsersRoles { get; set; }
    public DbSet<BookAuthor> BooksAuthors { get; set; }
    public DbSet<BookCategory> BooksCategories { get; set; }
    public DbSet<BookLanguage> BooksLanguages { get; set; }
    public DbSet<BookPhoto> BooksPhotos { get; set; }
    public DbSet<NewsPhoto> NewsPhotos { get; set; }


    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
      
    }
  }
}
