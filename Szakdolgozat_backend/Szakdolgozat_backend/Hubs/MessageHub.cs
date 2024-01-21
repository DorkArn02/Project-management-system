using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Szakdolgozat_backend.Hubs
{
    [Authorize]
    public class MessageHub : Hub<IMessageHub>
    {
        //public override async Task OnConnectedAsync()
        //{
        //    //await base.OnConnectedAsync();
        //    //var userid = Context.User.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        //    //await Console.Out.WriteLineAsync(userid);
        //}
    }
}
