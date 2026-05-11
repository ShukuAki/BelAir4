using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WebApplication1.Filters
{
    // Simple session-based user type authorization attribute.
    // Usage: [UserTypeAuthorize(3)] to allow only admins (type 3).
    public class UserTypeAuthorizeAttribute : ActionFilterAttribute
    {
        private readonly int[] _allowed;

        public UserTypeAuthorizeAttribute(params int[] allowed)
        {
            _allowed = allowed ?? new int[0];
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var http = context.HttpContext;
            var session = http.Session;

            var userType = session.GetInt32("UserType");
            if (userType == null || !_allowed.Contains(userType.Value))
            {
                // If request is an API call, return 401 instead of redirect
                var path = http.Request.Path.HasValue ? http.Request.Path.Value : string.Empty;
                if (!string.IsNullOrEmpty(path) && path.StartsWith("/api/"))
                {
                    context.Result = new UnauthorizedResult();
                }
                else
                {
                    // not authorized — redirect to login
                    context.Result = new RedirectToActionResult("login", "Home", null);
                }
            }

            base.OnActionExecuting(context);
        }
    }
}
