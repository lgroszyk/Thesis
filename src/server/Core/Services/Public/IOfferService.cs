using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące ofert sprzedaży książek do antykwariatu przez użytkowników strony
  public interface IOfferService
  {
    // Przesyła ofertę sprzedaży książki do antykwariatu.
    StatusResult<BasicAddStatus> SendOffer(string username, Offer offer);

    // Przesyła odpowiedź administratora do oferty sprzedaży książki.
    StatusResult<SendOfferResponseStatus> SendResponseToOffer(OfferResponseDto response);

    // Wgrywa plik przez użytkownika w celu sprzedaży ebooka.
    StatusResult<SendFileStatus> SendEbook(string username, int offerId, IFormFile file);

    // Dokonuje edycji statusu oferty sprzedaży książki przez administratora.
    StatusResult<BasicEditStatus> EditOfferStatus(int id, OfferStatusEditDto dto);

    // Dokonuje usunięcia oferty sprzedaży książki przez administratora.
    StatusResult<BasicDeleteStatus> DeleteOffer(int id);

    // Przekazuje dane konkretnej oferty sprzedaży książki do panelu administracyjnego strony.
    ContentResult<Offer> GetOfferById(int id);

    // Przekazuje dane ofert sprzedaży książki do panelu administracyjnego strony.
    ContentResult<IEnumerable<Offer>> GetAllOffers();

    // Przekazuje wszystkie możliwe statusy oferty sprzedaży książki.
    ContentResult<IEnumerable<OfferStatus>> GetOfferStatuses();

    // Przekazuje wszystkie możliwe statusy odpowiedzi administratora do oferty sprzedaży książki.
    ContentResult<IEnumerable<OfferResponseStatus>> GetOfferResponseStatuses();

    // Przekazuje użytkownikowi strony listę informacji o złożonych przez niego ofertach sprzedaży książki.
    ContentResult<IEnumerable<OfferInfoDto>> GetMyOffers(string username);

    // Przekazuje użytkownikowi strony informacje o konkretnej złożonej przez niego ofercie sprzedaży książki.
    ContentResult<OfferByIdInfoDto> GetMyOfferById(string username, int id);

    // Przewiduje poprawną cenę oferowanej książki przez system analityczny.
    ContentResult<AnalyticModelPrediction> AnalizeOffer(FormalizedOffer offer);
  }
}
