﻿namespace Szakdolgozat_backend.Hubs
{
    public interface IMessageHub
    {
        Task SendMessage(string message);
        Task SendStatusChange(string message);
    }
}
