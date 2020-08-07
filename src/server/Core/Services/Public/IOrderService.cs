using System.Collections.Generic;
using LGroszyk.AntiqueBookShop.Core.Models.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;

namespace LGroszyk.AntiqueBookShop.Core.Services.Public
{
  // Interfejs definiujący akcje dotyczące zamówień książek z oferty antykwariatu
  public interface IOrderService
  {
    // Przekazuje dane zamówień do panelu administracyjnego strony.
    ContentResult<IEnumerable<Order>> GetAllOrders();  

    // Przekazuje dane konkretnego zamówienia do panelu administracyjnego strony.
    ContentResult<Order> GetOrderById(int id);

    // Przekazuje wszystkie możliwe statusy zamówień.
    ContentResult<IEnumerable<OrderStatus>> GetOrderStatuses();

    // Dokonuje edycji statusu zamówienia przez administratora.
    StatusResult<BasicEditStatus> EditOrderStatus(int id, OrderStatusEditDto dto);

    // Dokonuje usunięcia zamówienia przez administratora.
    StatusResult<BasicDeleteStatus> DeleteOrder(int id);

    // Symuluje płatność online za zamówienie.
    StatusResult<ConfirmOnlinePaymentStatus> ConfirmOnlinePayment(string username, int orderId);

    // Wysyła zamówienie do antykwariatu.
    ContentResult<int> SendOrder(string username, SendOrderDto dto, bool onlinePayment);

    // Przekazuje użytkownikowi strony listę informacji o złożonych przez niego zamówieniach.
    ContentResult<IEnumerable<OrderInfoDto>> GetMyOrders(string username);

    // Przekazuje użytkownikowi strony informacje o konkretnym złożonym przez niego zamówieniu.
    ContentResult<OrderByIdInfoDto> GetMyOrderById(string username, int id);
  }
}
