using System.Collections.Generic;
using System.Linq;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using Microsoft.EntityFrameworkCore;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące zdjęć znajdujących się na serwerze
  public class PhotoService : IPhotoService
  {
    private readonly AppDbContext context;
    private readonly IHostingEnvironment hostingEnvironment;

    public PhotoService(AppDbContext context, IHostingEnvironment hostingEnvironment)
    {
      this.context = context;
      this.hostingEnvironment = hostingEnvironment;
    }

    // Wgrywa na serwer zdjęcie.
    public StatusResult<SendFileStatus> AddPhoto(SendFileDto dto)
    {
      var file = dto.File;
      var fileName = file.FileName;

      if (file.Length > 1024 * 1024) // 1 MB
      {
        return new StatusResult<SendFileStatus>
        {
          Status = SendFileStatus.FileInvalid
        };
      }

      if (file.Length > 0)
      {
        var validExtensions = new [] { ".png", ".jpg" };
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

        var directoryName = hostingEnvironment.WebRootPath + "/media";
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

      var photo = new Photo
      {
        Url = "/media/" + fileName,
      };
      context.Photos.Add(photo);
      context.SaveChanges();

      return new StatusResult<SendFileStatus>
      {
        Status = SendFileStatus.Ok
      };
    }

    // Usuwa zdjęcia z serwera.
    public StatusResult<PhotoRemoveStatus> DeletePhoto(int id)
    {
      var toDelete = context.Photos
        .Include(x => x.BooksPhotos)
        .Include(x => x.NewsPhotos)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<PhotoRemoveStatus>
        {
          Status = PhotoRemoveStatus.BadId
        };
      }

      var isMainPhoto = toDelete.BooksPhotos.Any(x => x.IsMainPhoto) || toDelete.NewsPhotos.Any(x => x.IsMainPhoto);
      if (isMainPhoto)
      {
        return new StatusResult<PhotoRemoveStatus>
        {
          Status = PhotoRemoveStatus.IsMainPhoto
        };
      }

      System.IO.File.Delete($"{hostingEnvironment.WebRootPath}{toDelete.Url}");

      foreach (var item in toDelete.BooksPhotos.AsEnumerable())
      {
        context.BooksPhotos.Remove(item);
      }
      foreach (var item in toDelete.NewsPhotos.AsEnumerable())
      {
        context.NewsPhotos.Remove(item);
      }
      context.Photos.Remove(toDelete);
      context.SaveChanges();

      return new StatusResult<PhotoRemoveStatus>
      {
        Status = PhotoRemoveStatus.Ok
      };
    }

    // Edytuje nazwę pliku ze zdjęciem.
    public StatusResult<EditPhotoNameStatus> EditPhotoName(int id, PhotoNameDto dto)
    {
      var toEdit = context.Photos
        .SingleOrDefault(x => x.Id == id);

      if (toEdit == null) 
      {
        return new StatusResult<EditPhotoNameStatus>
        {
          Status = EditPhotoNameStatus.BadId
        };
      }

      var directoryName = hostingEnvironment.WebRootPath + "/media";
      var isFilenameUnique = !System.IO.Directory.GetFiles(directoryName).Select(x => x.Split(Path.DirectorySeparatorChar).Last().Split('.').First()).Any(x => x == dto.Name);
      if (!isFilenameUnique)
      {
        return new StatusResult<EditPhotoNameStatus>
        {
          Status = EditPhotoNameStatus.Conflict
        };
      }

      System.IO.File.Move($"{hostingEnvironment.WebRootPath}{toEdit.Url}", $"{hostingEnvironment.WebRootPath}/media/{dto.Name}.{toEdit.Url.Split('.').Last()}");
      toEdit.Url = $"/media/{dto.Name}.{toEdit.Url.Split('.').Last()}";
      context.SaveChanges();

      return new StatusResult<EditPhotoNameStatus>
      {
        Status = EditPhotoNameStatus.Ok
      };
    }

    // Przekazuje dane dotyczące zdjęć znajdujących się na serwerze.
    public ContentResult<IEnumerable<PhotoDto>> GetAllPhotos()
    { 
      var photos = context.Photos
        .Include(x => x.BooksPhotos)
        .Include(x => x.NewsPhotos)
        .Select(x => new PhotoDto
        {
          Id = x.Id,
          BooksNumbers = x.BooksPhotos.Select(bp => bp.BookId),
          NewsNumbers = x.NewsPhotos.Select(np => np.NewsId),
          Name = GetFileName(x.Url),
          Url = x.Url
        });

      return new ContentResult<IEnumerable<PhotoDto>>
      {
        Content = photos
      };
    }

    // Metoda pomocnicza zwracająca nazwę pliku bez rozszerzenia
    private string GetFileName(string url)
    {
      return url.Split('/').Last().Split('.').First();
    }
  }
}
