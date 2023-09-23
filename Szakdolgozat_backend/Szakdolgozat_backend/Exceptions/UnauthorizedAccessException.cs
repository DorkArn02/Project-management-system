namespace Szakdolgozat_backend.Exceptions
{
    public class UnauthorizedAccessException : Exception
    {
        public UnauthorizedAccessException (string message) : base (message) { }
    }
}
