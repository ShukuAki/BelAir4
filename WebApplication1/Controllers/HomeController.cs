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
        private readonly Microsoft.Extensions.Logging.ILogger<HomeController> _logger;

        public HomeController(IRepo repo, Microsoft.Extensions.Logging.ILogger<HomeController> logger)
        {
            _repo = repo;
            _logger = logger;
        }
        public IActionResult aboutLagunaBelAir() => View();
        [WebApplication1.Filters.UserTypeAuthorize(3)]
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
        [WebApplication1.Filters.UserTypeAuthorize(2,3)]
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index");
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
            // store user type for authorization checks in views/controllers
            HttpContext.Session.SetInt32("UserType", user.Type);

            // Redirect based on user type: 3 = admin, 2 = staff, 1 = member
            return user.Type switch
            {
                3 => RedirectToAction("adminDashboard"),
                2 => RedirectToAction("staffDashboard"),
                1 => RedirectToAction("Index"),
                _ => RedirectToAction("Index")
            };
        }

        // Example: show users list (keeps DB usage)
        public async Task<IActionResult> Users()
        {
            var users = await _repo.GetAllAsync();
            return View(users);
        }

        [HttpPost("/register")] 
        [ValidateAntiForgeryToken] 
        public async Task<IActionResult> Register() 
        {
            var form = Request.Form;
            var email = form["email"].ToString().Trim();
            var password = form["password"].ToString();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                ModelState.AddModelError(string.Empty, "Email and password are required.");
                return View("register");
            }

            var existing = (await _repo.GetAllAsync()).FirstOrDefault(u => u.Username.ToLower() == email.ToLower());
            if (existing != null)
            {
                ModelState.AddModelError(string.Empty, "An account with that email already exists.");
                return View("register");
            }

            var user = new UserAccount { Username = email, Password = password, Type = 1 };
            await _repo.CreateAsync(user);

            // handle file upload (optional)
            var file = Request.Form.Files.GetFile("proofOfResidency");
            if (file != null && file.Length > 0)
            {
                var uploads = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
                var fileName = System.Guid.NewGuid().ToString() + System.IO.Path.GetExtension(file.FileName);
                var filePath = System.IO.Path.Combine(uploads, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await file.CopyToAsync(stream);
                }
            }

            TempData["RegisterSuccess"] = "Registration submitted. You may now log in.";
            return RedirectToAction("login");
        }

        // Forum APIs
        [HttpGet("/api/forums/posts")]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _repo.GetPostsAsync();
            return Json(posts);
        }

        [HttpGet("/api/forums/posts/{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _repo.GetPostByIdAsync(id);
            if (post is null) return NotFound();
            return Json(post);
        }

        [HttpPost("/api/forums/posts")]
        [WebApplication1.Filters.UserTypeAuthorize(1,2,3)]
        public async Task<IActionResult> CreatePost([FromBody] Post post)
        {
            if (post == null) return BadRequest();
            var username = HttpContext.Session.GetString("Username") ?? "Anonymous";
            post.Author = username;
            post.Date = System.DateTime.Now.ToString("MMM d, yyyy");
            _logger?.LogInformation("CreatePost called by {User} with title={Title}", username, post.Title);
            var created = await _repo.CreatePostAsync(post);
            _logger?.LogInformation("Post created id={Id}", created.Id);
            return Json(created);
        }

        [HttpPost("/api/forums/posts/{id}/replies")]
        [WebApplication1.Filters.UserTypeAuthorize(1,2,3)]
        public async Task<IActionResult> AddReply(int id, [FromBody] Reply reply)
        {
            if (reply == null) return BadRequest();
            reply.PostId = id;
            reply.Name = HttpContext.Session.GetString("Username") ?? reply.Name ?? "Anonymous";
            reply.Date = System.DateTime.Now.ToString("MMM d, yyyy");
            _logger?.LogInformation("AddReply called by {User} on post {PostId}", reply.Name, id);
            var ok = await _repo.AddReplyAsync(reply);
            if (ok) _logger?.LogInformation("Reply added to post {PostId}", id);
            if (!ok) return NotFound();
            return Ok();
        }

        // Vehicles & Pets API
        [HttpGet("/api/registrations/vehicles")]
        public async Task<IActionResult> GetVehicles()
        {
            var vehicles = await _repo.GetVehiclesAsync();
            return Json(vehicles);
        }

        [HttpPost("/api/registrations/vehicles")]
        [WebApplication1.Filters.UserTypeAuthorize(1,2,3)]
        public async Task<IActionResult> CreateVehicle([FromBody] Models.Vehicle vehicle)
        {
            if (vehicle == null) return BadRequest();
            vehicle.OwnerName = HttpContext.Session.GetString("Username") ?? vehicle.OwnerName ?? "Anonymous";
            vehicle.RegisteredDate = System.DateTime.Now.ToString("d");
            var created = await _repo.CreateVehicleAsync(vehicle);
            return Json(created);
        }

        [HttpGet("/api/registrations/pets")]
        public async Task<IActionResult> GetPets()
        {
            var pets = await _repo.GetPetsAsync();
            return Json(pets);
        }

        [HttpPost("/api/registrations/pets")]
        [WebApplication1.Filters.UserTypeAuthorize(1,2,3)]
        public async Task<IActionResult> CreatePet([FromBody] Models.Pet pet)
        {
            if (pet == null) return BadRequest();
            pet.OwnerName = HttpContext.Session.GetString("Username") ?? pet.OwnerName ?? "Anonymous";
            pet.RegisteredDate = System.DateTime.Now.ToString("d");
            var created = await _repo.CreatePetAsync(pet);
            return Json(created);
        }

        [HttpPost("/api/forums/posts/{id}/helpful")]
        public async Task<IActionResult> MarkHelpful(int id)
        {
            var ok = await _repo.MarkHelpfulAsync(id);
            if (!ok) return NotFound();
            return Ok();
        }
    }
}