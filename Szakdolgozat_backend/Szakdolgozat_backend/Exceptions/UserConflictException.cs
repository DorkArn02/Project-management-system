namespace Szakdolgozat_backend.Exceptions
{
    public class UserConflictException : Exception
    {
        public UserConflictException(string message) : base(message) { }
    }
}
