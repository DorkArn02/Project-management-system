using Microsoft.AspNetCore.SignalR;

namespace Szakdolgozat_backend.Hubs
{
    public class MessageHub : Hub<IMessageHub>
    {
        public async Task Send(string message)
        {
            await Clients.All.SendMessage(message);
        }
    }
}
