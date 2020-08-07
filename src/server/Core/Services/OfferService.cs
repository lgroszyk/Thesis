using System.Collections.Generic;
using System.Linq;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.ML;
using Microsoft.ML.Core.Data;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące ofert sprzedaży książek do antykwariatu przez użytkowników strony
  public class OfferService : IOfferService
  {
    private readonly AppDbContext context;
    private readonly IHostingEnvironment hostingEnvironment;


    public OfferService(AppDbContext context, IHostingEnvironment hostingEnvironment)
    {
      this.context = context;
      this.hostingEnvironment = hostingEnvironment;
    }

    // Przekazuje dane ofert sprzedaży książki do panelu administracyjnego strony.
    public ContentResult<IEnumerable<Offer>> GetAllOffers()
    {
      var offers = context.Offers
        .Include(x => x.OfferStatus)
        .Include(x => x.OfferResponse)
          .ThenInclude(x => x.OfferResponseStatus)
        .Include(x => x.User);

      foreach (var item in offers)
      {
        if (item.User != null)
        {
          item.User.PasswordHash = null;
          item.User.EmailConfirmed = false;
        }
      }

      return new ContentResult<IEnumerable<Offer>>
      {
        Content = offers
      };
    }

    // Przekazuje dane konkretnej oferty sprzedaży książki do panelu administracyjnego strony.
    public ContentResult<Offer> GetOfferById(int id)
    {
      var offer = context.Offers
        .Include(x => x.OfferStatus)
        .Include(x => x.OfferResponse)
        .Include(x => x.User)
        .SingleOrDefault(x => x.Id == id);

      if (offer.User != null)
      {
        offer.User.PasswordHash = null;
        offer.User.EmailConfirmed = false;
      }
    
      return new ContentResult<Offer>
      {
        Content = offer
      };
    }

    // Przekazuje wszystkie możliwe statusy oferty sprzedaży książki.
    public ContentResult<IEnumerable<OfferStatus>> GetOfferStatuses()
    {
      var offerStatuses = context.OfferStatuses.AsEnumerable();

      return new ContentResult<IEnumerable<OfferStatus>>
      {
        Content = offerStatuses
      };
    }

    // Przekazuje wszystkie możliwe statusy odpowiedzi administratora do oferty sprzedaży książki.
    public ContentResult<IEnumerable<OfferResponseStatus>> GetOfferResponseStatuses()
    {
      var offerResponseStatuses = context.OfferResponseStatuses.AsEnumerable();

      return new ContentResult<IEnumerable<OfferResponseStatus>>
      {
        Content = offerResponseStatuses
      };
    }

    // Wgrywa plik przez użytkownika w celu sprzedaży ebooka.
    public StatusResult<SendFileStatus> SendEbook(string username, int offerId, IFormFile file)
    {
      var offer = context.Offers
        .Include(x => x.User)
        .SingleOrDefault(x => x.Id == offerId);
        
      if (offer == null || offer.User.Name != username)
      {
        return new StatusResult<SendFileStatus>
        {
          Status = SendFileStatus.OfferIdOrUserInvalid
        };
      }

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
        fileName = file.FileName;
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

      var fileEntity = new LGroszyk.AntiqueBookShop.Core.Models.Public.File
      {
        Name = "/private_static/files/" + fileName,
        UploadDate = System.DateTime.Now
      };
      context.Files.Add(fileEntity);

      var newOfferStatus = context.OfferStatuses
        .Single(x => x.Id == 3);
      offer.OfferStatusId = newOfferStatus.Id;
      offer.FileId = fileEntity.Id;

      context.SaveChanges();

      return new StatusResult<SendFileStatus>
      {
        Status = SendFileStatus.Ok
      };
    }

    // Przesyła ofertę sprzedaży książki do antykwariatu.
    public StatusResult<BasicAddStatus> SendOffer(string username, Offer offer)
    {
      var statusId = context.OfferStatuses.Single(x => x.Id == 1).Id;
      offer.OfferStatusId = statusId;
      var userId = context.Users.Single(x => x.Name == username).Id;
      offer.UserId = userId;
      offer.Date = System.DateTime.Now;

      context.Offers.Add(offer);
      context.SaveChanges();

      return new StatusResult<BasicAddStatus>
      {
        Status = BasicAddStatus.Ok
      };
    }

    // Przesyła odpowiedź administratora do oferty sprzedaży książki.
    public StatusResult<SendOfferResponseStatus> SendResponseToOffer(OfferResponseDto response)
    {
      var offer = context.Offers
        .Include(x => x.OfferResponse)
        .SingleOrDefault(x => x.Id == response.OfferId);

      if (offer == null)
      {
        return new StatusResult<SendOfferResponseStatus>
        {
          Status = SendOfferResponseStatus.NoOffer
        };
      }

      if (offer.OfferResponse != null)
      {
        return new StatusResult<SendOfferResponseStatus>
        {
          Status = SendOfferResponseStatus.OfferHasResponse
        };
      }

      var newOfferStatusId = context.OfferStatuses.Single(x => x.Id == 2).Id;
      offer.OfferStatusId = newOfferStatusId;
      
      var toAdd = new OfferResponse
      {
        ResponseDate = System.DateTime.Now,
        ResponseText = response.ResponseText,
        ProposedPrice = response.ProposedPrice,
        OfferResponseStatusId = response.OfferResponseStatusId,
        
      };
      context.OfferResponses.Add(toAdd);
      offer.OfferResponseId = toAdd.Id;

      context.SaveChanges();

      return new StatusResult<SendOfferResponseStatus>
      {
        Status = SendOfferResponseStatus.Ok
      };
    }

    // Dokonuje usunięcia oferty sprzedaży książki przez administratora.
    public StatusResult<BasicDeleteStatus> DeleteOffer(int id)
    {
      var toDelete = context.Offers
        .Include(x => x.OfferResponse)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      var offerResponse = toDelete.OfferResponse;

      context.Offers.Remove(toDelete);
      if (offerResponse != null)
      {
        context.OfferResponses.Remove(offerResponse);
      }
      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dokonuje edycji statusu oferty sprzedaży książki przez administratora.
    public StatusResult<BasicEditStatus> EditOfferStatus(int id, OfferStatusEditDto dto)
    {
      var toEdit = context.Offers
        .SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.OfferStatusId = dto.StatusId;
      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Przekazuje użytkownikowi strony listę informacji o złożonych przez niego ofertach sprzedaży książki.
    public ContentResult<IEnumerable<OfferInfoDto>> GetMyOffers(string username)
    {
      var offers = context.Offers
        .Include(x => x.User)
        .Where(x => x.User.Name == username);

      var dto = offers
        .Include(x => x.OfferStatus)
        .Select(x => new OfferInfoDto
        {
          Id = x.Id,
          Date = x.Date,
          Status = x.OfferStatus.NamePl,
          StatusEn = x.OfferStatus.NameEn
        });

      return new ContentResult<IEnumerable<OfferInfoDto>>
      {
        Content = dto
      };
    }

    // Przekazuje użytkownikowi strony informacje o konkretnej złożonej przez niego ofercie sprzedaży książki.
    public ContentResult<OfferByIdInfoDto> GetMyOfferById(string username, int id)
    {
      var offer = context.Offers
        .Include(x => x.OfferStatus)
        .Include(x => x.OfferResponse)
          .ThenInclude(x => x.OfferResponseStatus)
        .Include(x => x.User)
        .Where(x => x.User.Name == username)
        .SingleOrDefault(x => x.Id == id);

      if (offer == null)
      {
        return new ContentResult<OfferByIdInfoDto>
        {
          Content = null
        };
      }

      var dto = new OfferByIdInfoDto
      {
        Id = offer.Id,
        Date = offer.Date,
        About = offer.About,
        Condition = offer.Condition,
        Category = offer.Category,
        Language = offer.Language,
        IsEbook = offer.IsEbook,
        WritingTime = offer.WritingTime,
        PrintingTime = offer.PrintingTime,
        TransactionPrice = offer.TransactionPrice,
        Status = offer.OfferStatus.NamePl,
        StatusEn = offer.OfferStatus.NameEn,
        StatusId = offer.OfferStatusId
      };

      if (offer.OfferResponse != null)
      {
        dto.Response = new OfferByIdResponseInfoDto
        {
          Status = offer.OfferResponse.OfferResponseStatus.NamePl,
          StatusEn = offer.OfferResponse.OfferResponseStatus.NameEn,
          StatusId = offer.OfferResponse.OfferResponseStatusId,
          Date = offer.OfferResponse.ResponseDate,
          Text = offer.OfferResponse.ResponseText,
          TransactionPrice = offer.OfferResponse.ProposedPrice
        };
      }

      return new ContentResult<OfferByIdInfoDto>
      {
        Content = dto
      };
    }

    // Przewiduje poprawną cenę oferowanej książki przez system analityczny.
    public ContentResult<AnalyticModelPrediction> AnalizeOffer(FormalizedOffer offer)
    {
      var mlContext = new MLContext(0);

      ITransformer model;
      using (var stream = new FileStream(hostingEnvironment.ContentRootPath + "/private_static/model.zip", FileMode.Open, FileAccess.Read, FileShare.Read))
      {
        model = mlContext.Model.Load(stream);
      }
      
      var toAnalize = new AnalyticModel
      {
        AuthorPopularity = offer.AuthorPopularity,
        Condition = offer.Condition,
        Category = offer.Category,
        Language = offer.Language,
        IsEbook = offer.IsEbook,
        WritingTime = offer.WritingTime,
        PrintingTime = offer.PrintingTime
      };

      var predictionEngine = model.CreatePredictionEngine<AnalyticModel, AnalyticModelPrediction>(mlContext);
      var predictedPrice = predictionEngine.Predict(toAnalize);

      return new ContentResult<AnalyticModelPrediction>
      {
        Content = predictedPrice
      };
    }
  }
}
