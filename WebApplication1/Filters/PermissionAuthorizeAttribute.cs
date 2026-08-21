using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using WebApplication1.Repository;

namespace WebApplication1.Filters
{
    /// <summary>
    /// Permission-based authorization that checks if admin user has specific permission
    /// Usage: [PermissionAuthorize("staff.manage", "audit.view")]
    /// </summary>
    public class PermissionAuthorizeAttribute : ActionFilterAttribute
    {
        private readonly string[] _requiredPermissions;
        private readonly bool _requireAll;

        /// <summary>
        /// Create permission check filter
        /// </summary>
        /// <param name="requiredPermissions">Permission keys required (e.g. "staff.manage", "roles.assign")</param>
        public PermissionAuthorizeAttribute(params string[] requiredPermissions)
        {
            _requiredPermissions = requiredPermissions ?? Array.Empty<string>();
            _requireAll = false; // By default, require ANY permission (OR logic)
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var http = context.HttpContext;
            var session = http.Session;

            // Check if user is logged in as admin
            var userType = session.GetInt32("UserType");
            var userId = session.GetInt32("UserId");

            if (userType != 3 || userId == null)
            {
                context.Result = IsApiRequest(context)
                    ? new UnauthorizedResult()
                    : new RedirectToActionResult("login", "Home", null);
                return;
            }

            // Get repo service
            var repo = http.RequestServices.GetService<IRepo>();
            if (repo == null)
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            // Get admin user with role
            var adminUser = await repo.GetAdminUserByIdAsync(userId.Value);
            if (adminUser?.Role == null)
            {
                context.Result = IsApiRequest(context)
                    ? new ForbidResult()
                    : new RedirectToActionResult("accessdenied", "Home", null);
                return;
            }

            // Check if role is protected (super admin) - always allow
            if (adminUser.Role.IsProtected == true)
            {
                await next();
                return;
            }

            // Get role permissions
            var rolePermissions = await repo.GetRolePermissionsAsync(adminUser.RoleId);
            var permissionKeys = rolePermissions.Select(rp => rp.Permission?.PermissionKey).Where(k => k != null).ToList();

            // Check if user has required permissions
            bool hasPermission = _requireAll
                ? _requiredPermissions.All(p => permissionKeys.Contains(p))
                : _requiredPermissions.Any(p => permissionKeys.Contains(p));

            if (!hasPermission)
            {
                context.Result = IsApiRequest(context)
                    ? new ForbidResult()
                    : new RedirectToActionResult("accessdenied", "Home", null);
                return;
            }

            await next();
        }

        private bool IsApiRequest(ActionExecutingContext context)
        {
            var path = context.HttpContext.Request.Path.HasValue ? context.HttpContext.Request.Path.Value : string.Empty;
            return !string.IsNullOrEmpty(path) && path.StartsWith("/api/");
        }
    }
}
