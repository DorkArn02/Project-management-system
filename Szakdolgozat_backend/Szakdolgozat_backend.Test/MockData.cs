using Pipelines.Sockets.Unofficial.Arenas;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.Test
{
    internal class MockData
    {
        public static List<Project> GetProjects() 
        {
            return new List<Project>()
            {
                new ()
                {
                    Title = "Test project",
                    Created = DateTime.Now,
                    Updated = DateTime.Now,
                    Description = "Test description",
                    Id = new Guid("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                    Participants = new[]
                    {
                        new Participant()
                        {
                            Id = 1,
                            UserId = new Guid("8699da70-f678-4a05-93ce-a387c98e5b81"),
                            ProjectId = new Guid("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                            RoleId = 1
                        }
                    }
                }
            };
        }

        public static List<ProjectList> GetProjectLists()
        {
            return new List<ProjectList>()
            {
                new()
                {
                    Title = "In Progress",
                    Position = 1,
                    Id = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a"),
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                },
                new()
                {
                    Title = "Done",
                    Position = 2,
                    Id = Guid.Parse("6f94a1a1-93fb-4402-8b11-62937d75f87a"),
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a")
                }
            };
        }

        public static List<Participant> GetParticipants()
        {
            return new List<Participant>()
            {
                new()
                {
                    Id = 1,
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                    UserId = Guid.Parse("8699da70-f678-4a05-93ce-a387c98e5b81"),
                    RoleId = 1
                }
            };
        }

        public static List<AssignedPerson> GetAssignedPeople()
        {
            return new List<AssignedPerson>()
            {
                new ()
                {
                    Id = 1,
                    IssueId = Guid.Parse("4a94b1a1-93fb-4402-8b11-62937d75f87a"),
                    UserId = Guid.Parse("8699da70-f678-4a05-93ce-a387c98e5b81")
                }
            };
        }

        public static List<Comment> GetComments()
        {
            return new List<Comment>()
            {
                new()
                {
                    Id = Guid.Parse("7c94b1a1-93fb-4402-8b11-62937d75f87a"),
                    Content = "asd",
                    IssueId = Guid.Parse("4a94b1a1-93fb-4402-8b11-62937d75f87a")
                }
            };
        }

        public static List<Issue> GetIssues()
        {
            return new List<Issue>()
            {
                new()
                {
                    Id = Guid.Parse("4a94b1a1-93fb-4402-8b11-62937d75f87a"),
                    Title = "Issue Title",
                    Description = "Issue description",
                    ProjectListId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a"),
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                },
                new()
                {
                    Id = Guid.Parse("5b94b1a1-93fb-4402-8b11-62937d75f87a"),
                    Title = "Issue Title2",
                    Description = "Issue description2",
                    ProjectListId = Guid.Parse("3f94b1a1-93fb-4402-8b11-62937d75f87a"),
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                }
            };
        }

        public static List<Notification> GetNotifications()
        {
            return new List<Notification>()
            {
                new()
                {
                    Content = "Hello World",
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                    Created = DateTime.Now,
                    ModifierId = Guid.Parse("d32268f9-54f6-4a0c-a9da-9a5d977b2798"),
                    Id = Guid.Parse("8e14b1a1-93fb-4402-8b11-62937d75f87a"),
                    UserId = Guid.Parse("8699da70-f678-4a05-93ce-a387c98e5b81")
                }
            };
        }
        public static List<AuditLog> GetAuditLogs()
        {
            return new List<AuditLog>()
            {
                new()
                {
                    Content = "test",
                    ProjectId = Guid.Parse("1f90b1a1-93fb-4402-8b11-62937d75f87a"),
                    Id = Guid.NewGuid()
                }
            };
        }

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
