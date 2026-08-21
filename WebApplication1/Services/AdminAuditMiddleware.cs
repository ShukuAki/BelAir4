using Microsoft.AspNetCore.Http;
using WebApplication1.Models;
using WebApplication1.Repository;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace WebApplication1.Services
{
    /// <summary>
    /// Middleware to automatically log all admin API calls to audit log
    /// </summary>
    public class AdminAuditMiddleware
    {
        private readonly RequestDelegate _next;

        public AdminAuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, IRepo repo)
        {
            // Only log admin API calls
            if (!context.Request.Path.StartsWithSegments("/api/admin"))
            {
                await _next(context);
                return;
            }

            // Check if user is admin
            var userType = context.Session.GetInt32("UserType");
            var userId = context.Session.GetInt32("UserId");
            var username = context.Session.GetString("Username");

            if (userType != 3 || userId == null)
            {
                await _next(context);
                return;
            }

            // Capture request details
            var method = context.Request.Method;
            var path = context.Request.Path.ToString();
            var queryString = context.Request.QueryString.ToString();
            var requestBody = await ReadRequestBodyAsync(context.Request);

            // Store original response body stream
            var originalBody = context.Response.Body;

            try
            {
                // Capture response
                using var responseBody = new MemoryStream();
                context.Response.Body = responseBody;

                await _next(context);

                // Read response
                responseBody.Seek(0, SeekOrigin.Begin);
                var responseText = await new StreamReader(responseBody).ReadToEndAsync();
                responseBody.Seek(0, SeekOrigin.Begin);

                // Copy response back to original stream
                await responseBody.CopyToAsync(originalBody);

                // Log to audit - use admin_user_id = 0 as system/session-based logging
                var action = DetermineAction(method, path);
                var category = DetermineCategory(path);
                var outcome = context.Response.StatusCode < 400 ? "Success" : "Failed";

                try
                {
                    var auditLog = new AuditLog
                    {
                        AdminUserId = 0, // System/Session-based (not tied to admin_users FK)
                        Action = action,
                        ActionCategory = category,
                        TargetEntity = ExtractEntityType(path),
                        TargetEntityId = ExtractEntityId(path) ?? "N/A",
                        OldValue = method == "PUT" || method == "DELETE" ? requestBody : null,
                        NewValue = method == "POST" || method == "PUT" ? requestBody : null,
                        Timestamp = DateTime.UtcNow,
                        IPAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                        UserAgent = context.Request.Headers["User-Agent"].ToString(),
                        Outcome = outcome,
                        Notes = $"[{username ?? $"User#{userId}"}] {method} {path}{queryString} - Status: {context.Response.StatusCode}"
                    };

                    await repo.LogAuditActionAsync(auditLog);
                }
                catch (Exception logEx)
                {
                    // Log the error but don't fail the request
                    Console.WriteLine($"Audit logging failed: {logEx.Message}");
                }
            }
            catch
            {
                // Ensure response is written even if logging fails
                context.Response.Body = originalBody;
                throw;
            }
        }

        private async System.Threading.Tasks.Task<string?> ReadRequestBodyAsync(HttpRequest request)
        {
            if (request.ContentLength == null || request.ContentLength == 0)
                return null;

            try
            {
                request.EnableBuffering();
                var buffer = new byte[Convert.ToInt32(request.ContentLength)];
                await request.Body.ReadAsync(buffer, 0, buffer.Length);
                request.Body.Position = 0;
                return Encoding.UTF8.GetString(buffer);
            }
            catch
            {
                return null;
            }
        }

        private string DetermineAction(string method, string path)
        {
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (segments.Length < 3)
                return $"{method} Admin API";

            var entity = segments[2]; // /api/admin/{entity}

            return method switch
            {
                "GET" => $"Viewed {entity}",
                "POST" => $"Created {entity}",
                "PUT" => $"Updated {entity}",
                "DELETE" => $"Deleted {entity}",
                _ => $"{method} {entity}"
            };
        }

        private string DetermineCategory(string path)
        {
            if (path.Contains("/staff")) return "Staff Management";
            if (path.Contains("/roles") || path.Contains("/permissions")) return "Role & Permission Management";
            if (path.Contains("/audit-log")) return "Audit Review";
            if (path.Contains("/residents")) return "Resident Management";
            if (path.Contains("/settings")) return "System Settings";
            if (path.Contains("/bans")) return "Moderation";
            if (path.Contains("/backups")) return "System Maintenance";
            if (path.Contains("/invitations")) return "Staff Invitations";
            return "General Admin";
        }

        private string ExtractEntityType(string path)
        {
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            return segments.Length >= 3 ? segments[2] : "Unknown";
        }

        private string? ExtractEntityId(string path)
        {
            var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

            // Check if there's a numeric ID in the path (e.g., /api/admin/staff/5)
            for (int i = 3; i < segments.Length; i++)
            {
                if (int.TryParse(segments[i], out _))
                    return segments[i];
            }

            return null;
        }
    }
}
