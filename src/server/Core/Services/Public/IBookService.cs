using System.Collections.Generic;
using LGroszyk.AntiqueBookShop.Core.Models;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące książek oferowanych przez antykwariat
  public interface IBookService
  {
    // Przekazuje książki z oferty antykwariatu do publicznej części aplikacji, z uwzględnieniem filtrów, jakie ustawił użytkownik.
    ContentResult<BooksFilteringResultDto> GetBooksForGivenPage(BooksFilterDto filter);

    // Przekazuje książki z bazy danych do panelu administracyjnego.
    ContentResult<BooksFilteringResultDto> GetAllBooksForGivenPage (BooksFilterDto filter);
    
    // Przekazuje informacje o konkretnej książce.
    ContentResult<Book> GetBookById(int id);

    // Edytuje książkę.
    StatusResult<BasicEditStatus> EditBook(int id, Book book);

    // Usuwa książkę.
    StatusResult<BasicDeleteStatus> DeleteBook(int id);

    // Dodaje książkę.
    StatusResult<BasicAddStatus> AddBook(Book book);

    // Przekazuje dane o autorach książek z oferty.
    ContentResult<IEnumerable<Author>> GetAllAuthors();

    // Przekazuje dane o kategoriach książek z oferty.
    ContentResult<IEnumerable<Category>> GetAllCategories();

    // Przekazuje dane o językach książek z oferty.
    ContentResult<IEnumerable<Language>> GetAllLanguages();

    // Przekazuje dane autora książek.
    ContentResult<Author> GetAuthorById(int id);

    // Edytuje autora książek.
    StatusResult<BasicEditStatus> EditAuthor(int id, Author author);

    // Usuwa autora książek.
    StatusResult<BasicDeleteStatus> DeleteAuthor(int id);
    
    // Dodaje autora książek.
    StatusResult<BasicAddStatus> AddAuthor(Author author);

    // Przekazuje informacje o kategorii książek.
    ContentResult<Category> GetCategoryById(int id);

    // Edytuje kategorię książek.
    StatusResult<BasicEditStatus> EditCategory(int id, Category category);

    // Usuwa kategorię książek.
    StatusResult<BasicDeleteStatus> DeleteCategory(int id);
    
    // Dodaje kategorię książek.
    StatusResult<BasicAddStatus> AddCategory(Category category);

    // Przekazuje informacje o języku książek.
    ContentResult<Language> GetLanguageById(int id);

    // Edytuje język książek.
    StatusResult<BasicEditStatus> EditLanguage(int id, Language language);

    // Usuwa język książek.
    StatusResult<BasicDeleteStatus> DeleteLanguage(int id);
    
    // Dodaje język książek.
    StatusResult<BasicAddStatus> AddLanguage(Language language);

    // Przekazuje informacje o ebookach zakupionych przez użytkownika strony.
    ContentResult<IEnumerable<EbookByIdInfoDto>> GetMyEbooks(string username);

    // Przekazuje informacje o konkretnym ebooku zakupionym przez użytkownika strony.
    ContentResult<EbookByIdInfoDto> GetMyEbookById(string username, int id);

    // Pobiera plik z zakupionym ebookiem.
    ContentResult<DownloadFileDto> DownloadMyEbookById(string username, int id);

    // Wgrywa ebooka na serwer.
    StatusResult<SendFileStatus> AddFile(SendFileDto dto);

    // Edytuje nazwę pliku ebooka.    
    StatusResult<EditFileNameStatus> EditFileName(int id, FileNameDto dto);

    // Edytuje właściciela ebooka.
    StatusResult<EditFileOwnerNameStatus> EditFileOwnerName(int id, FileOwnerNameDto dto);

    // Usuwa plik ebooka z serwera.
    StatusResult<FileRemoveStatus> DeleteFile(int id);

    // Przekazuje administratorowi strony informacje o konkretnym ebooku znajdującym się na serwerze.
    ContentResult<FileInfoDto> GetFileInfoById(int id);

    // Przekazuje administratorowi strony informacje o ebookach znajdujących się na serwerze.
    ContentResult<IEnumerable<FileInfoDto>> GetAllFiles();

    // Pobiera plik ebooka znajdujący się na serwerze strony.
    ContentResult<DownloadFileDto> DownloadFileById(int id);
  }
}
