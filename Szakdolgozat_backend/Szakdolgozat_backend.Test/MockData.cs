using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Test
{
    internal class MockData
    {
        public static List<User> GetUsers()
        {

            return new List<User>()
            {
                new()
                {
                    Id = new Guid("8699da70-f678-4a05-93ce-a387c98e5b81"),
                    Email = "example1@gmail.com",
                    FirstName = "Teszt",
                    LastName = "János",
                    PasswordHash = "12345",
                    Registered = DateTime.Now,
                },
                new() {
                    Id = new Guid("d32268f9-54f6-4a0c-a9da-9a5d977b2798"),
                    Email = "example2@gmail.com",
                    FirstName = "Teszt",
                    LastName = "Péter",
                    PasswordHash = "12345",
                    Registered = DateTime.Now,
                },
                new() {
                    Id = new Guid("fc6ec29a-daf3-41c1-bc3f-5381136790e5"),
                    Email = "example3@gmail.com",
                    FirstName = "Teszt",
                    LastName = "Balázs",
                    PasswordHash = "12345",
                    Registered = DateTime.Now,
                }
            };
        }
    }
}
