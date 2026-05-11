using Microsoft.AspNetCore.Mvc;
using WebApplication1.Repository;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private readonly IRepo _repo;

        public HomeController(IRepo repo)
        {
            _repo = repo;
        }
        public IActionResult aboutLagunaBelAir() => View();
        public IActionResult adminDashboard() => View();
        public IActionResult advertisements() => View();
        public IActionResult announcement() => View();
        public IActionResult calendars() => View();
        public IActionResult committeesBods() => View();
        public IActionResult communityMap() => View();
        public IActionResult contacts() => View();
        public IActionResult forgotPassword() => View();
        public IActionResult formsDocuments() => View();
        public IActionResult forums() => View();
        public IActionResult Index() => View();
        public IActionResult landMarks() => View();
        public IActionResult meetingAgendas() => View();
        public IActionResult register() => View();
        public IActionResult reportConcerns () => View();
        public IActionResult reserve () => View();
        public IActionResult staffDashboard () => View();
        public IActionResult vehiclePetRegistration () => View();
        // GET: /login
        [HttpGet]
        [Route("login")]
        public IActionResult login()
        {
            // explicit path so the exact view file is rendered
            return View("~/Views/Home/login.cshtml");
        }

        
        [HttpPost("login")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                ModelState.AddModelError(string.Empty, "Username and password are required.");
                return View("~/Views/Home/login.cshtml");
            }

            var user = await _repo.AuthenticateAsync(username, password);
            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Invalid credentials.");
                return View("~/Views/Home/login.cshtml");
            }

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);

            return RedirectToAction("adminDashboard");
        }

        // Example: show users list (keeps DB usage)
        public async Task<IActionResult> Users()
        {
            var users = await _repo.GetAllAsync();
            return View(users);
        }
    }
}