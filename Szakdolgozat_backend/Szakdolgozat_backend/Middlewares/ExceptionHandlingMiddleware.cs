using System;
using System.Net;
using System.Text.Json;
using Szakdolgozat_backend.Exceptions;

namespace Szakdolgozat_backend.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            HttpStatusCode status;
            string message;
            string? stackTrace;

            switch (exception)
            {
                case NotFoundException:
                    message = exception.Message;
                    status = HttpStatusCode.NotFound;
                    stackTrace = exception.StackTrace;
                    break;
                case Exceptions.UnauthorizedAccessException:
                    message = exception.Message;
                    status = HttpStatusCode.Unauthorized;
                    stackTrace = exception.StackTrace;
                    break;
                case UserConflictException:
                    message = exception.Message;
                    status = HttpStatusCode.Conflict;
                    stackTrace = exception.StackTrace;
                    break;
                default:
                    message = exception.Message;
                    status = HttpStatusCode.InternalServerError;
                    stackTrace = exception.StackTrace;
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;
            var result = JsonSerializer.Serialize(new {error = message, stackTrace});
            await context.Response.WriteAsync(result);
        }
    }
}
