using System.Collections.Generic;
using System.Linq;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.DataAccess.Public;
using Microsoft.EntityFrameworkCore;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services
{
  // Klasa zawierająca akcje dotyczące zamówień książek z oferty antykwariatu
  public class OrderService : IOrderService
  {
    private readonly AppDbContext context;

    public OrderService(AppDbContext context)
    {
      this.context = context;
    }

    // Wysyła zamówienie do antykwariatu.
    public ContentResult<int> SendOrder(string username, SendOrderDto dto, bool onlinePayment)
    {
      var orderStatusId = onlinePayment ? 2 : 4;
      var orderStatus = context.OrderStatuses.Single(x => x.Id == orderStatusId);
      var orderUser = context.Users.Single(x => x.Name == username);
      var orderBooks = context.Books.Where(x => dto.BooksIds.Contains(x.Id));

      var newOrder = new Order
      {
        UserEmail = orderUser.Email,
        UserId = orderUser.Id,
        OrderStatusId = orderStatus.Id,
        Date = System.DateTime.Now
      };

      context.Orders.Add(newOrder);
      foreach (var book in orderBooks)
      {
        book.OrderId = newOrder.Id;
        book.HadEverOrder = true;
      }

      context.SaveChanges();

      return new ContentResult<int>
      {
        Content = newOrder.Id
      };
    }

    // Symuluje płatność online za zamówienie.
    public StatusResult<ConfirmOnlinePaymentStatus> ConfirmOnlinePayment(string username, int orderId)
    {
      var order = context.Orders
        .Include(x => x.User)
        .SingleOrDefault(x => x.Id == orderId);

      if (order == null)
      {
        return new StatusResult<ConfirmOnlinePaymentStatus>
        {
          Status = ConfirmOnlinePaymentStatus.OfferNotFound
        };
      }

      if (order.User.Name != username)
      {
        return new StatusResult<ConfirmOnlinePaymentStatus>
        {
          Status = ConfirmOnlinePaymentStatus.OfferNotBelongsToDesignatedUser
        };
      }

      var confirmedOrderStatus = context.OrderStatuses.Single(x => x.Id == 3);

      order.OrderStatusId = confirmedOrderStatus.Id;
      context.SaveChanges();

      return new StatusResult<ConfirmOnlinePaymentStatus>
      {
        Status = ConfirmOnlinePaymentStatus.Ok
      };
    }

    // Dokonuje usunięcia zamówienia przez administratora.
    public StatusResult<BasicDeleteStatus> DeleteOrder(int id)
    {
      var toDelete = context.Orders
        .Include(x => x.Books)
        .SingleOrDefault(x => x.Id == id);

      if (toDelete == null)
      {
        return new StatusResult<BasicDeleteStatus>
        {
          Status = BasicDeleteStatus.BadId
        };
      }

      foreach (var item in toDelete.Books)
      {
        item.OrderId = null;
      }
      context.Orders.Remove(toDelete);
      context.SaveChanges();

      return new StatusResult<BasicDeleteStatus>
      {
        Status = BasicDeleteStatus.Ok
      };
    }

    // Dokonuje edycji statusu zamówienia przez administratora.
    public StatusResult<BasicEditStatus> EditOrderStatus(int id, OrderStatusEditDto dto)
    {
      var toEdit = context.Orders
        .SingleOrDefault(x => x.Id == id);

      if (toEdit == null)
      {
        return new StatusResult<BasicEditStatus>
        {
          Status = BasicEditStatus.BadId
        };
      }

      toEdit.OrderStatusId = dto.StatusId;
      context.SaveChanges();

      return new StatusResult<BasicEditStatus>
      {
        Status = BasicEditStatus.Ok
      };
    }

    // Przekazuje dane zamówień do panelu administracyjnego strony.
    public ContentResult<IEnumerable<Order>> GetAllOrders()
    {
      var orders = context.Orders
        .Include(x => x.OrderStatus)
        .Include(x => x.User)
        .Include(x => x.Books);

      foreach (var item in orders)
      {
        if (item.User != null)
        {
          item.User.PasswordHash = null;
          item.User.EmailConfirmed = false;
        }
      }

      return new ContentResult<IEnumerable<Order>>
      {
        Content = orders
      };
    }

    // Przekazuje dane konkretnego zamówienia do panelu administracyjnego strony.
    public ContentResult<Order> GetOrderById(int id)
    {
      var order = context.Orders
        .Include(x => x.OrderStatus)
        .Include(x => x.User)
        .Include(x => x.Books)
        .SingleOrDefault(x => x.Id == id);

      if (order == null)
      {
        return new ContentResult<Order>
        {
          Content = null
        }; 
      }

      if (order.User != null)
      {
        order.User.PasswordHash = null;
        order.User.EmailConfirmed = false;
      }

      return new ContentResult<Order>
      {
        Content = order
      };
    }

    // Przekazuje wszystkie możliwe statusy zamówień.
    public ContentResult<IEnumerable<OrderStatus>> GetOrderStatuses()
    {
      var orderStatuses = context.OrderStatuses.AsEnumerable();

      return new ContentResult<IEnumerable<OrderStatus>>
      {
        Content = orderStatuses
      };
    }

    // Przekazuje użytkownikowi strony listę informacji o złożonych przez niego zamówieniach.
    public ContentResult<IEnumerable<OrderInfoDto>> GetMyOrders(string username)
    {
      var orders = context.Orders
        .Include(x => x.User)
        .Where(x => x.User.Name == username);

      var dto = orders
        .Include(x => x.OrderStatus)
        .Include(x => x.Books)
        .Select(x => new OrderInfoDto
        {
          Id = x.Id,
          Date = x.Date,
          Status = x.OrderStatus.NamePl,
          BooksCount = x.Books.Count,
          TotalPrice = x.Books.Sum(book => book.Price),
          StatusEn = x.OrderStatus.NameEn
        });

      return new ContentResult<IEnumerable<OrderInfoDto>>
      {
        Content = dto
      };
    }

    // Przekazuje użytkownikowi strony informacje o konkretnym złożonym przez niego zamówieniu.
    public ContentResult<OrderByIdInfoDto> GetMyOrderById(string username, int id)
    {
      var order = context.Orders
        .Include(x => x.OrderStatus)
        .Include(x => x.Books)
        .Include(x => x.User)
        .Where(x => x.User.Name == username)
        .SingleOrDefault(x => x.Id == id);

      if (order == null)
      {
        return new ContentResult<OrderByIdInfoDto>
        {
          Content = null
        };
      }

      var dto = new OrderByIdInfoDto
      {
        Id = order.Id,
        Date = order.Date,
        Status = order.OrderStatus.NamePl,
        StatusEn = order.OrderStatus.NameEn,
        Books = order.Books.Select(x => new OrdersBookInfoDto
        {
          Title = x.Title,
          Price = x.Price
        })
      };

      return new ContentResult<OrderByIdInfoDto>
      {
        Content = dto
      };
    }
  }
}
