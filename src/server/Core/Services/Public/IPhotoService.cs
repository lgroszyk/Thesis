using System.Collections.Generic;
using LGroszyk.AntiqueBookShop.Core.Models;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące zdjęć znajdujących się na serwerze
  public interface IPhotoService
  {
    // Przekazuje dane dotyczące zdjęć znajdujących się na serwerze.
    ContentResult<IEnumerable<PhotoDto>> GetAllPhotos();

    // Wgrywa na serwer zdjęcie.
    StatusResult<SendFileStatus> AddPhoto(SendFileDto dto);

    // Edytuje nazwę pliku ze zdjęciem.
    StatusResult<EditPhotoNameStatus> EditPhotoName(int id, PhotoNameDto dto);

    // Usuwa zdjęcia z serwera.
    StatusResult<PhotoRemoveStatus> DeletePhoto(int id);
  }
}
