using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące książek oferowanych przez antykwariat
  public class BookService : IBookService
  {
    private readonly AppDbContext context;
    private readonly IHostingEnvironment hostingEnvironment;

    public BookService(AppDbContext context, IHostingEnvironment hostingEnvironment)
    {
      this.context = context;
      this.hostingEnvironment = hostingEnvironment;
    }

    // Przekazuje książki z oferty antykwariatu do publicznej części aplikacji, z uwzględnieniem filtrów, jakie ustawił użytkownik.
    public ContentResult<BooksFilteringResultDto> GetBooksForGivenPage(BooksFilterDto filter)
    {
      var books = this.GetFilteringResult(filter)
        .Where(x => x.HadEverOrder == false);

      var count = books.Count();

      books = books.Skip( (filter.Page - 1) * filter.BooksPerPage )
        .Take(filter.BooksPerPage);

      var dto = new BooksFilteringResultDto
      {
        Books = books,
        TotalBooksCountForThisFilter = count
      };

      return new ContentResult<BooksFilteringResultDto>()
      {
        Content = dto
      };
    }

    // Przekazuje książki z bazy danych do panelu administracyjnego.
    public ContentResult<BooksFilteringResultDto> GetAllBooksForGivenPage(BooksFilterDto filter)
    {
      var books = this.GetFilteringResult(filter);

      var count = books.Count();

      books = books.Skip( (filter.Page - 1) * filter.BooksPerPage )
        .Take(filter.BooksPerPage);

      var dto = new BooksFilteringResultDto
      {
        Books = books,
        TotalBooksCountForThisFilter = count
      };

      return new ContentResult<BooksFilteringResultDto>()
      {
        Content = dto
      };
    }

    // Przekazuje dane o autorach książek z oferty.
    public ContentResult<IEnumerable<Author>> GetAllAuthors()
    {
      var authors = context.Authors.AsEnumerable();

      return new ContentResult<IEnumerable<Author>>
      {
        Content = authors
      };    
    }

    // Przekazuje dane o kategoriach książek z oferty.
    public ContentResult<IEnumerable<Category>> GetAllCategories()
    {
      var categories = context.Categories.AsEnumerable();

      return new ContentResult<IEnumerable<Category>>
      {
        Content = categories
      };
    }

    // Przekazuje dane o językach książek z oferty.
    public ContentResult<IEnumerable<Language>> GetAllLanguages()
    {
      var languages = context.Languages.AsEnumerable();

      return new ContentResult<IEnumerable<Language>>
      {
        Content = languages
      };
    }

    // Przekazuje informacje o konkretnej książce.
    public ContentResult<Book> GetBookById(int id)
    {
      var book = context.Books
        .Include(x => x.BooksPhotos)
          .ThenInclude(x => x.Photo)
        .Include(x => x.BooksAuthors)
          .ThenInclude(x => x.Author)
        .Include(x => x.BooksCategories)
          .ThenInclude(x => x.Category)     
        .Include(x => x.BooksLanguages)
          .ThenInclude(x => x.Language)
        .SingleOrDefault(x => x.Id == id);

      return new ContentResult<Book>
      {
        Content = book
      };
    }

    // Edytuje książkę.
    public StatusResult<BasicEditStatus> EditBook(int id, Book book)
    {
      var toEdit = context.Books.SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.ISBN = book.ISBN;
      toEdit.IsElectronic = book.IsElectronic;
      toEdit.Title = book.Title;
      toEdit.Price = book.Price;
      toEdit.DescriptionPl = book.DescriptionPl;
      toEdit.DescriptionEn = book.DescriptionEn;
      toEdit.ReleaseDate = book.ReleaseDate;
      toEdit.PurchaseByStoreDate = book.PurchaseByStoreDate;

      ReplaceManyToManyRelationships(context.BooksCategories, book.BooksCategories, book.Id);
      ReplaceManyToManyRelationships(context.BooksLanguages, book.BooksLanguages, book.Id);
      ReplaceManyToManyRelationships(context.BooksAuthors, book.BooksAuthors, book.Id);
      ReplaceManyToManyRelationships(context.BooksPhotos, book.BooksPhotos, book.Id);

      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Metoda pomocnicza do edycji relacji typu "wiele do wielu"
    private void ReplaceManyToManyRelationships<T> (DbSet<T> table, IEnumerable<T> items, int bookId) where T : BookItem
    {
        var oldItems = table.Where(x => x.BookId == bookId).ToArray();
        for (int i = oldItems.Length - 1; i >= 0 ; i--)
        {
          table.Remove(oldItems[i]);
        }
        var newItems = items;
        foreach (var item in newItems)
        {
          table.Add(item);
        }
    }

    // Usuwa książkę.
    public StatusResult<BasicDeleteStatus> DeleteBook(int id)
    {         
      var toDelete = context.Books
        .Include(x => x.BooksPhotos)
          .ThenInclude(x => x.Photo)
        .Include(x => x.BooksAuthors)
          .ThenInclude(x => x.Author)
        .Include(x => x.BooksCategories)
          .ThenInclude(x => x.Category)
        .Include(x => x.BooksLanguages)
          .ThenInclude(x => x.Language)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      foreach (var item in toDelete.BooksPhotos)
      {
        context.BooksPhotos.Remove(item);
      }
      foreach (var item in toDelete.BooksAuthors)
      {
        context.BooksAuthors.Remove(item);
      }
      foreach (var item in toDelete.BooksCategories)
      {
        context.BooksCategories.Remove(item);
      }
      foreach (var item in toDelete.BooksLanguages)
      {
        context.BooksLanguages.Remove(item);
      }
      context.Books.Remove(toDelete);

      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dodaje książkę.
    public StatusResult<BasicAddStatus> AddBook(Book book)
    {
      var toAdd = new Book
      {
        Title = book.Title,
        ISBN = book.ISBN,
        IsElectronic = book.IsElectronic,
        Price = book.Price,
        DescriptionPl = book.DescriptionPl,
        DescriptionEn = book.DescriptionEn,
        ReleaseDate = book.ReleaseDate,
        PurchaseByStoreDate = book.PurchaseByStoreDate
      };

      context.Books.Add(toAdd);

      foreach (var item in book.BooksPhotos)
      {
          context.BooksPhotos.Add(new BookPhoto
          {
            BookId = toAdd.Id,
            PhotoId = item.PhotoId,
            IsMainPhoto = item.IsMainPhoto
          });
      }

      foreach (var item in book.BooksAuthors)
      {
        context.BooksAuthors.Add(new BookAuthor
        {
          BookId = toAdd.Id,
          AuthorId = item.AuthorId
        });
      }

      foreach (var item in book.BooksCategories)
      {
        context.BooksCategories.Add(new BookCategory
        {
          BookId = toAdd.Id,
          CategoryId = item.CategoryId
        });
      }

      foreach (var item in book.BooksLanguages)
      {
        context.BooksLanguages.Add(new BookLanguage
        {
          BookId = toAdd.Id,
          LanguageId = item.LanguageId
        });
      }

      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };
    }

    // Metoda pomocnicza zwracająca książki z uwzględnieniem filtrów ustawionych przez użytkownika
    private IEnumerable<Book> GetFilteringResult(BooksFilterDto filter)
    {
      Func<Book, bool> containsTitleOrAuthorSearchingPhrase = x => filter.TitleOrAuthorFilter == null ? true :
        x.Title.Contains(filter.TitleOrAuthorFilter) || 
        x.BooksAuthors.Any(a => a.Author.FirstName.Contains(filter.TitleOrAuthorFilter) ||
                          a.Author.LastName.Contains(filter.TitleOrAuthorFilter) || 
                          (a.Author.NickName == null ? false : a.Author.NickName.Contains(filter.TitleOrAuthorFilter)));

      Func<Book, bool> isElectronicOrNotLikeInFilter = x => filter.IsElectronic == null ? true : x.IsElectronic == filter.IsElectronic;          

      Func<Book, bool> containsAnyOfFiltersCategories = x => filter.CategoriesIds == null || filter.CategoriesIds.Count() == 0 ? true :
          x.BooksCategories.Select(bc => bc.Category.Id).Intersect(filter.CategoriesIds).Count() > 0;

      Func<Book, bool> containsAnyOfFiltersLanguages= x => filter.LanguagesIds == null || filter.LanguagesIds.Count() == 0 ? true :
          x.BooksLanguages.Select(bl => bl.Language.Id).Intersect(filter.LanguagesIds).Count() > 0;

      Func<Book, bool> youngerThanMinimumReleaseDate = x => !filter.ReleaseMinimumDate.HasValue ? true :
        x.ReleaseDate > filter.ReleaseMinimumDate;

      Func<Book, bool> olderThanMaximumReleaseDate = x => !filter.ReleaseMaximumDate.HasValue ? true :
        x.ReleaseDate < filter.ReleaseMaximumDate;

      Func<Book, bool> youngerThanMinimumPurchaseDate = x => !filter.PurchaseMinimumDate.HasValue ? true :
        x.PurchaseByStoreDate > filter.PurchaseMinimumDate;

      Func<Book, bool> olderThanMaximumPurchaseDate = x => !filter.PurchaseMaximumDate.HasValue ? true :
        x.PurchaseByStoreDate < filter.PurchaseMaximumDate;

      Func<Book, bool> cheaperThanMaximumPrice = x => filter.MaximumPrice == null ? true : filter.MaximumPrice > x.Price;

      var books = context.Books
        .Include(x => x.BooksPhotos)
          .ThenInclude(x => x.Photo)
        .Include(x => x.BooksAuthors)
          .ThenInclude(x => x.Author)
        .Include(x => x.BooksCategories)
          .ThenInclude(x => x.Category)    
        .Include(x => x.BooksLanguages)
          .ThenInclude(x => x.Language)
        .OrderByDescending(x => x.PurchaseByStoreDate)
        .AsEnumerable()
        .Where(isElectronicOrNotLikeInFilter)
        .Where(containsTitleOrAuthorSearchingPhrase)
        .Where(containsAnyOfFiltersCategories)
        .Where(containsAnyOfFiltersLanguages)
        .Where(youngerThanMinimumReleaseDate)
        .Where(olderThanMaximumReleaseDate)
        .Where(youngerThanMinimumPurchaseDate)
        .Where(olderThanMaximumPurchaseDate)
        .Where(cheaperThanMaximumPrice);

        return books;
    }

    // Przekazuje dane autora książek.
    public ContentResult<Author> GetAuthorById(int id)
    {
      var author = context.Authors.SingleOrDefault(x => x.Id == id);

      return new ContentResult<Author>
      {
        Content = author
      };
    }

    // Edytuje autora książek.
    public StatusResult<BasicEditStatus> EditAuthor(int id, Author author)
    {
      var toEdit = context.Authors.SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.FirstName = author.FirstName;
      toEdit.LastName = author.LastName;
      toEdit.NickName = author.NickName;

      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Usuwa autora książek.
    public StatusResult<BasicDeleteStatus> DeleteAuthor(int id)
    {
      var toDelete = context.Authors.SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      context.Authors.Remove(toDelete);
      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dodaje autora książek.
    public StatusResult<BasicAddStatus> AddAuthor(Author author)
    {
      var toAdd = author;
      context.Authors.Add(toAdd);

      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };
    }

    // Przekazuje informacje o kategorii książek.
    public ContentResult<Category> GetCategoryById(int id)
    {
      var category = context.Categories.SingleOrDefault(x => x.Id == id);

      return new ContentResult<Category>
      {
        Content = category
      };
    }

    // Edytuje kategorię książek.
    public StatusResult<BasicEditStatus> EditCategory(int id, Category category)
    {
      var toEdit = context.Categories.SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.NamePl = category.NamePl;
      toEdit.NameEn = category.NameEn;

      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Usuwa kategorię książek.
    public StatusResult<BasicDeleteStatus> DeleteCategory(int id)
    {
      var toDelete = context.Categories.SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      context.Categories.Remove(toDelete);
      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dodaje kategorię książek.
    public StatusResult<BasicAddStatus> AddCategory(Category category)
    {
      var toAdd = category;
      context.Categories.Add(toAdd);
      
      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };    
    }

    // Przekazuje informacje o języku książek.
    public ContentResult<Language> GetLanguageById(int id)
    {
      var language = context.Languages.SingleOrDefault(x => x.Id == id);

      return new ContentResult<Language>
      {
        Content = language
      };
    }

    // Edytuje język książek.
    public StatusResult<BasicEditStatus> EditLanguage(int id, Language language)
    {
      var toEdit = context.Languages.SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.NamePl = language.NamePl;
      toEdit.NameEn = language.NameEn;

      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Usuwa język książek.
    public StatusResult<BasicDeleteStatus> DeleteLanguage(int id)
    {
      var toDelete = context.Languages.SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      context.Languages.Remove(toDelete);
      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dodaje język książek.
    public StatusResult<BasicAddStatus> AddLanguage(Language language)
    {
      var toAdd = language;
      context.Languages.Add(toAdd);
      
      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };  
    }

    // Przekazuje informacje o ebookach zakupionych przez użytkownika strony.
    public ContentResult<IEnumerable<EbookByIdInfoDto>> GetMyEbooks(string username)
    {
      var ebooks = context.Files
        .Include(x => x.User)
        .Where(x => x.User.Name == username)
        .Select(x => new EbookByIdInfoDto { Id = x.Id, Name = x.Name })
        .ToArray();

      for (var i = 0; i < ebooks.Count(); i++)
      {
        var ebook = ebooks[i];
        ebook.Name = ebook.Name.Split('/').Last();
      }

      return new ContentResult<IEnumerable<EbookByIdInfoDto>>
      {
        Content = ebooks
      };
    }

    // Przekazuje informacje o konkretnym ebooku zakupionym przez użytkownika strony.
    public ContentResult<EbookByIdInfoDto> GetMyEbookById(string username, int id)
    {
      var ebook = context.Files
        .Include(x => x.User)
        .Where(x => x.User.Name == username)
        .SingleOrDefault(x => x.Id == id);

      if (ebook == null)
      {
        return new ContentResult<EbookByIdInfoDto>
        {
          Content = null
        };
      }

      var dto = new EbookByIdInfoDto
      {
        Id = ebook.Id,
        Name = ebook.Name.Split('/').Last(),
      };

      return new ContentResult<EbookByIdInfoDto>
      {
        Content = dto
      };
    }

    // Wgrywa ebooka na serwer.
    public StatusResult<SendFileStatus> AddFile(SendFileDto dto)
    {
      var file = dto.File;
      var fileName = file.FileName;

      if (file.Length > 1024 * 1024 * 1024) // 1 GB
      {
        return new StatusResult<SendFileStatus>
        {
          Status = SendFileStatus.FileInvalid
        };
      }

      if (file.Length > 0)
      {
        var validExtensions = new [] { ".mobi", ".epub", ".pdf" };
        var isValidFile = false;
        foreach (var extension in validExtensions)
        {
          if (file.FileName.EndsWith(extension))
          {
            isValidFile = true;
            break;
          }
        }
        if (!isValidFile)
        {
          return new StatusResult<SendFileStatus>
          {
            Status = SendFileStatus.FileInvalid
          };
        }

        var directoryName = hostingEnvironment.ContentRootPath + "/private_static/files";
        var isFilenameUnique = !System.IO.Directory.GetFiles(directoryName).Select(x => x.Split(Path.DirectorySeparatorChar).Last()).Any(x => x == fileName);
        if (!isFilenameUnique)
        {
          for (int i = 1; true; i++)
          {
            var newFilename = fileName.Split('.').First() + "_" + i + "." + fileName.Split('.').Last();
            isFilenameUnique = !System.IO.Directory.GetFiles(directoryName).Select(x => x.Split(Path.DirectorySeparatorChar).Last()).Any(x => x == newFilename);
            if (isFilenameUnique)
            {
              fileName = newFilename;
              break;
            }
          }
        }
        
        var filePath = directoryName + "/" + fileName;
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
          file.CopyTo(stream);
        }
      }

      var fileEntity = new Models.Public.File
      {
        Name = "/private_static/files/" + fileName,
        UploadDate = DateTime.Now
      };
      context.Files.Add(fileEntity);
      context.SaveChanges();

      return new StatusResult<SendFileStatus>
      {
        Status = SendFileStatus.Ok
      };
    }

    // Edytuje właściciela ebooka.
    public StatusResult<EditFileOwnerNameStatus> EditFileOwnerName(int id, FileOwnerNameDto dto)
    {
      var toEdit = context.Files
        .Include(x => x.User)
        .SingleOrDefault(x => x.Id == id);

      if (toEdit == null) 
      {
        return new StatusResult<EditFileOwnerNameStatus>
        {
          Status = EditFileOwnerNameStatus.BadId
        };
      }   

      if (dto.Name == string.Empty)
      {
        toEdit.UserId = null;
      }
      else
      {
        var user = context.Users.SingleOrDefault(x => x.Name == dto.Name);
        if (user == null)
        {
          return new StatusResult<EditFileOwnerNameStatus>
          {
            Status = EditFileOwnerNameStatus.UserNotFound
          };
        }

        toEdit.UserId = user.Id;
        toEdit.ShareTime = DateTime.Now;
      }

      context.SaveChanges();

      return new StatusResult<EditFileOwnerNameStatus>
      {
        Status = EditFileOwnerNameStatus.Ok
      };

    }

    // Edytuje nazwę pliku ebooka.
    public StatusResult<EditFileNameStatus> EditFileName(int id, FileNameDto dto)
    {
      var toEdit = context.Files
        .SingleOrDefault(x => x.Id == id);

      if (toEdit == null) 
      {
        return new StatusResult<EditFileNameStatus>
        {
          Status = EditFileNameStatus.BadId
        };
      }


      var directoryName = hostingEnvironment.ContentRootPath + "/private_static/files";
      var isFilenameUnique = !System.IO.Directory.GetFiles(directoryName).Select(x => x.Split(Path.DirectorySeparatorChar).Last().Split('.').First()).Any(x => x == dto.Name);
      if (!isFilenameUnique)
      {
        return new StatusResult<EditFileNameStatus>
        {
          Status = EditFileNameStatus.Conflict
        };
      }

      System.IO.File.Move($"{hostingEnvironment.ContentRootPath}{toEdit.Name}", $"{hostingEnvironment.ContentRootPath}/private_static/files/{dto.Name}.{toEdit.Name.Split('.').Last()}");
      toEdit.Name = $"/private_static/files/{dto.Name}.{toEdit.Name.Split('.').Last()}";
      context.SaveChanges();

      return new StatusResult<EditFileNameStatus>
      {
        Status = EditFileNameStatus.Ok
      };
    }

    // Usuwa plik ebooka z serwera.
    public StatusResult<FileRemoveStatus> DeleteFile(int id)
    {
      var toDelete = context.Files
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<FileRemoveStatus>
        {
          Status = FileRemoveStatus.BadId
        };
      }

      System.IO.File.Delete($"{hostingEnvironment.ContentRootPath}{toDelete.Name}");

      context.Files.Remove(toDelete);
     
      var offerWithThisFile = context.Offers.SingleOrDefault(x => x.FileId == toDelete.Id);
      if (offerWithThisFile != null)
      {
        offerWithThisFile.FileId = null;
      }
     
      context.SaveChanges();

      return new StatusResult<FileRemoveStatus>
      {
        Status = FileRemoveStatus.Ok
      };
    }

    // Przekazuje administratorowi strony informacje o konkretnym ebooku znajdującym się na serwerze.
    public ContentResult<FileInfoDto> GetFileInfoById(int id)
    {
      var file = context.Files
        .Include(x => x.User)
        .SingleOrDefault(x => x.Id == id);

      if (file == null)
      {
        return new ContentResult<FileInfoDto>
        {
          Content = null
        };
      }


      var dto = new FileInfoDto
      {
        Id = file.Id,
        Url = hostingEnvironment.ContentRootPath + "/" + file.Name,
        Name = file.Name.Split('/').Last().Split('.').First(),
        SizeInMb = Math.Round(new FileInfo(hostingEnvironment.ContentRootPath + "/" + file.Name).Length / 1024.0 / 1024.0, 2),
        UploadDate = file.UploadDate,
        Username = file.User?.Name,
        NameWithExtension = file.Name.Split('/').Last()
      };
      
      return new ContentResult<FileInfoDto>
      {
        Content = dto
      };
    }

    // Przekazuje administratorowi strony informacje o ebookach znajdujących się na serwerze.
    public ContentResult<IEnumerable<FileInfoDto>> GetAllFiles()
    {
      var files = context.Files
        .Select(x => new FileInfoDto
        {
          Id = x.Id,
          Name = GetFileName(x.Name),
          UploadDate = x.UploadDate
        });

      return new ContentResult<IEnumerable<FileInfoDto>>
      {
        Content = files
      };
    }
    
    // Metoda pomocnicza zwracająca nazwę pliku bez rozszerzenia
    private string GetFileName(string url)
    {
      return url.Split('/').Last().Split('.').First();
    }

    // Pobiera plik z zakupionym ebookiem.
    public ContentResult<DownloadFileDto> DownloadMyEbookById(string username, int id)
    {
      var ebook = context.Files
        .Include(x => x.User)
        .Where(x => x.User.Name == username)
        .SingleOrDefault(x => x.Id == id);

      if (ebook == null)
      {
        return new ContentResult<DownloadFileDto>
        {
          Content = null
        };
      }

      var ebookName = ebook.Name.Split('/').Last();
      var dto = new DownloadFileDto
      {
        Name = ebookName,
        Type = ebookName == "pdf" ? "application/pdf" : "application/epub+zip"
      };

      return new ContentResult<DownloadFileDto>
      {
        Content = dto
      };
    }

    // Pobiera plik ebooka znajdujący się na serwerze strony.
    public ContentResult<DownloadFileDto> DownloadFileById(int id)
    {
      var ebook = context.Files
        .SingleOrDefault(x => x.Id == id);

      if (ebook == null)
      {
        return new ContentResult<DownloadFileDto>
        {
          Content = null
        };
      }

      var ebookName = ebook.Name.Split('/').Last();
      var dto = new DownloadFileDto
      {
        Name = ebookName,
        Type = ebookName == "pdf" ? "application/pdf" : "application/epub+zip"
      };

      return new ContentResult<DownloadFileDto>
      {
        Content = dto
      };
    }
  }
}