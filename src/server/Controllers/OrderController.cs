using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LGroszyk.AntiqueBookShop.Core.Services.Public;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Dto;
using LGroszyk.AntiqueBookShop.Core.Models.Public.Statuses;
using LGroszyk.AntiqueBookShop.Core.Models.Public;

namespace LGroszyk.AntiqueBookShop.Controllers
{
  // Kontroler pośredniczący w akcjach dotyczących zamówień składanych przez użytkowników strony
  [Route("api/orders")]
  [Authorize]
  public class OrderController : Controller
  {
    private readonly IOrderService orderService;

    public OrderController(IOrderService orderService)
    {
      this.orderService = orderService;
    }

    // Pośredniczy w przekazaniu danych zamówień do panelu administracyjnego strony.
    [HttpGet("")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllOrders()
    {
      var orders = orderService.GetAllOrders().Content;

      return Ok(orders);
    }

    // Pośredniczy w przekazaniu wszystkich możliwych statusów zamówień.
    [HttpGet("statuses")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetOrderStatuses()
    {
      var statuses = orderService.GetOrderStatuses().Content;

      return Ok(statuses);
    }

    // Pośredniczy w przekazaniu danych konkretnego zamówienia do panelu administracyjnego strony.
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetOrderById(int id)
    {
      var order = orderService.GetOrderById(id).Content;

      if (order == null)
      {
        return NotFound();
      }

      return Ok(order);
    }

    // Pośredniczy w edycji przez administratora statusu zamówienia.
    [HttpPut("edit/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult EditOrderStatus(int id, [FromBody]OrderStatusEditDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var editStatus = orderService.EditOrderStatus(id, dto).Status;

      switch (editStatus)
      {
        case BasicEditStatus.Ok:
          return NoContent();

        case BasicEditStatus.BadId:
          return NotFound();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w usunięciu przez administratora zamówienia.
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteOrder(int id)
    {
      var deleteStatus = orderService.DeleteOrder(id).Status;

      switch (deleteStatus)
      {
        case BasicDeleteStatus.Ok:
          return NoContent();

        case BasicDeleteStatus.BadId:
          return NotFound();
          
        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w symulacji płatności online za zamówienie.
    [HttpGet("confirm_payment/{id}")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult ConfirmOnlinePayment(int id)
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;
      var orderId = id;
      
      var confirmStatus = orderService.ConfirmOnlinePayment(username, orderId).Status;

      switch (confirmStatus)
      {
        case ConfirmOnlinePaymentStatus.Ok:
          return NoContent();

        case ConfirmOnlinePaymentStatus.OfferNotFound:
        case ConfirmOnlinePaymentStatus.OfferNotBelongsToDesignatedUser:
          return NotFound();

        default:
          return StatusCode(500);
      }
    }

    // Pośredniczy w zamówieniu opłacanego gotówką lub kartą.
    [HttpPost("send")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult OrderForPersonalCollection ([FromBody]SendOrderDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;
      
      var orderId = orderService.SendOrder(username, dto, false).Content;

      return Ok(new { OrderId = orderId });
    }

    // Pośredniczy w zamówieniu opłacanego online.
    [HttpPost("send_online")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult OrderForOnlineCollection ([FromBody]SendOrderDto dto)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;
      
      var orderId = orderService.SendOrder(username, dto, true).Content;

      return Ok(new { OrderId = orderId });
    }

    // Pośredniczy w przekazaniu użytkownikowi strony listy informacji o złożonych zamówieniach.
    [HttpGet("my")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult GetMyOrders()
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var orders = orderService.GetMyOrders(username).Content;

      return Ok(orders);
    }

    // Pośredniczy w przekazaniu użytkownikowi strony informacji o konkretnym złożonym przez niego zamówieniu.
    [HttpGet("my/{id}")]
    [Authorize(Roles = "Default, Admin")]
    public IActionResult GetMyOrderById(int id)
    {
      var username = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value;

      var order = orderService.GetMyOrderById(username, id).Content;

      if (order == null)
      {
        return NotFound();
      }

      return Ok(order);
    }
  }
}
