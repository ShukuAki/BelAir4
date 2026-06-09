using Microsoft.AspNetCore.Mvc;
using WebApplication1.Repository;
using WebApplication1.Services;
using WebApplication1.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private readonly IRepo _repo;
        private readonly IAiAnalysisService _aiService;
        private readonly Microsoft.Extensions.Logging.ILogger<HomeController> _logger;

        public HomeController(IRepo repo, IAiAnalysisService aiService, Microsoft.Extensions.Logging.ILogger<HomeController> logger)
        {
            _repo = repo;
            _aiService = aiService;
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
        [HttpGet]
        public IActionResult Register() => View();

        [HttpGet("/api/registrations/pending")]
        public async Task<IActionResult> GetPendingRegistrations()
        {
            var pendingRegistrations = await _repo.GetPendingRegistrationsAsync();
            return Json(pendingRegistrations);
        }

        [HttpGet("/api/registrations/approved")]
        public async Task<IActionResult> GetApprovedRegistrations()
        {
            var approvedRegistrations = await _repo.GetApprovedRegistrationsAsync();
            return Json(approvedRegistrations);
        }

        [HttpPost("/api/registrations/{id}/approve")]
        public async Task<IActionResult> ApproveRegistration(int id)
        {
            _logger?.LogInformation("ApproveRegistration called for ID: {Id}", id);
            var reviewedBy = HttpContext.Session.GetString("Username") ?? "Admin";
            _logger?.LogInformation("Reviewed by: {ReviewedBy}", reviewedBy);
            var result = await _repo.ApproveRegistrationAsync(id, reviewedBy);
            _logger?.LogInformation("ApproveRegistration result: {Result}", result);
            return Ok(new { success = result });
        }

        [HttpPost("/api/registrations/{id}/reject")]
        public async Task<IActionResult> RejectRegistration(int id, [FromBody] string reason)
        {
            var reviewedBy = HttpContext.Session.GetString("Username") ?? "Admin";
            await _repo.RejectRegistrationAsync(id, reviewedBy, reason);
            return Ok(new { success = true });
        }

        // Reservation APIs
        [HttpGet("/api/reservations")]
        public async Task<IActionResult> GetReservations()
        {
            var reservations = await _repo.GetReservationsAsync();
            return Json(reservations);
        }

        [HttpGet("/api/reservations/pending")]
        public async Task<IActionResult> GetPendingReservations()
        {
            var reservations = await _repo.GetReservationsByStatusAsync("pending");
            return Json(reservations);
        }

        [HttpGet("/api/reservations/amenity/{amenity}")]
        public async Task<IActionResult> GetReservationsByAmenity(string amenity)
        {
            var reservations = await _repo.GetReservationsByAmenityAsync(amenity);
            return Json(reservations);
        }

        [HttpPost("/api/reservations")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> CreateReservation([FromBody] Reservation reservation)
        {
            if (reservation == null || string.IsNullOrWhiteSpace(reservation.Amenity)
                || string.IsNullOrWhiteSpace(reservation.Date)
                || string.IsNullOrWhiteSpace(reservation.StartTime)
                || string.IsNullOrWhiteSpace(reservation.EndTime))
            {
                return BadRequest(new { success = false, message = "Missing required reservation fields." });
            }

            var username = HttpContext.Session.GetString("Username");
            if (string.IsNullOrWhiteSpace(username))
            {
                return Unauthorized(new { success = false, message = "You must be logged in to make a reservation." });
            }

            reservation.UserId = username;
            if (string.IsNullOrWhiteSpace(reservation.ResidentName))
                reservation.ResidentName = username;

            _logger?.LogInformation("CreateReservation by {User} for {Amenity} on {Date}", reservation.UserId, reservation.Amenity, reservation.Date);
            var created = await _repo.CreateReservationAsync(reservation);
            return Json(created);
        }

        [HttpPost("/api/reservations/{id}/approve")]
        [WebApplication1.Filters.UserTypeAuthorize(2,3)]
        public async Task<IActionResult> ApproveReservation(int id)
        {
            var reviewedBy = HttpContext.Session.GetString("Username") ?? "Staff";
            var ok = await _repo.ApproveReservationAsync(id, reviewedBy);
            if (!ok) return NotFound();
            return Ok(new { success = true });
        }

        [HttpPost("/api/reservations/{id}/reject")]
        [IgnoreAntiforgeryToken]
        [WebApplication1.Filters.UserTypeAuthorize(2,3)]
        public async Task<IActionResult> RejectReservation(int id, [FromBody] string reason)
        {
            var reviewedBy = HttpContext.Session.GetString("Username") ?? "Staff";
            var ok = await _repo.RejectReservationAsync(id, reviewedBy, reason ?? "");
            if (!ok) return NotFound();
            return Ok(new { success = true });
        }
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RegisterPost()
        {
            _logger?.LogInformation("RegisterPost called");
            var form = Request.Form;
            var firstName = form["firstName"].ToString().Trim();
            var lastName = form["lastName"].ToString().Trim();
            // Compose full name from first + last; fall back to legacy single fullName field.
            var fullName = string.Join(" ", new[] { firstName, lastName }
                .Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
            if (string.IsNullOrWhiteSpace(fullName))
                fullName = form["fullName"].ToString().Trim();
            var email = form["email"].ToString().Trim();
            var mobile = form["mobile"].ToString().Trim();
            var password = form["password"].ToString();
            var confirmPassword = form["confirmPassword"].ToString();
            var residentType = form["residentType"].ToString().Trim();

            _logger?.LogInformation("Form data: fullName={FullName}, email={Email}, mobile={Mobile}, residentType={ResidentType}", fullName, email, mobile, residentType);

            // Handle address array from JavaScript (name="address[]")
            var addressValues = form["address[]"];
            _logger?.LogInformation("Address values count: {Count}", addressValues.Count);

            string address;
            if (addressValues.Count > 0)
            {
                address = string.Join(", ", addressValues.Select(a => a.ToString().Trim())).Trim();
            }
            else
            {
                // Fallback: try to get single address field
                address = form["address"].ToString().Trim();
            }

            _logger?.LogInformation("Address: {Address}", address);

            var termsAgreement = form["termsAgreement"].ToString();

            // Validation
            if (string.IsNullOrWhiteSpace(fullName))
            {
                ModelState.AddModelError(string.Empty, "Full name is required.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                ModelState.AddModelError(string.Empty, "Email is required.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(mobile))
            {
                ModelState.AddModelError(string.Empty, "Mobile number is required.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                ModelState.AddModelError(string.Empty, "Password is required.");
                return View("register");
            }

            if (password != confirmPassword)
            {
                ModelState.AddModelError(string.Empty, "Passwords do not match.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(residentType))
            {
                ModelState.AddModelError(string.Empty, "Resident type is required.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(address))
            {
                ModelState.AddModelError(string.Empty, "Address is required.");
                return View("register");
            }

            if (string.IsNullOrWhiteSpace(termsAgreement))
            {
                ModelState.AddModelError(string.Empty, "You must agree to the terms.");
                return View("register");
            }

            // Check if email already exists in registrations or user accounts
            var existingUser = (await _repo.GetAllAsync()).FirstOrDefault(u => u.Username.ToLower() == email.ToLower());
            if (existingUser != null)
            {
                ModelState.AddModelError(string.Empty, "An account with that email already exists.");
                return View("register");
            }

            // Handle file upload
            string? proofOfResidencyPath = null;
            _logger?.LogInformation("Total files in request: {Count}", Request.Form.Files.Count);
            foreach (var formFile in Request.Form.Files)
            {
                _logger?.LogInformation("File found: {Name}, {FileName}, {Length}", formFile.Name, formFile.FileName, formFile.Length);
            }
            var file = Request.Form.Files.GetFile("proofOfResidency");
            _logger?.LogInformation("File upload: file={File}, length={Length}", file?.FileName, file?.Length);

            if (file != null && file.Length > 0)
            {
                var uploads = System.IO.Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "registrations");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
                var fileName = System.Guid.NewGuid().ToString() + System.IO.Path.GetExtension(file.FileName);
                var filePath = System.IO.Path.Combine(uploads, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await file.CopyToAsync(stream);
                }
                proofOfResidencyPath = $"/uploads/registrations/{fileName}";
                _logger?.LogInformation("File saved: {Path}", proofOfResidencyPath);
            }
            else
            {
                _logger?.LogWarning("No file uploaded");
                ModelState.AddModelError(string.Empty, "Proof of residency document is required.");
                return View("register");
            }

            // Create registration record
            var registration = new Registration
            {
                FirstName = string.IsNullOrWhiteSpace(firstName) ? null : firstName,
                LastName = string.IsNullOrWhiteSpace(lastName) ? null : lastName,
                FullName = fullName,
                Email = email,
                Mobile = mobile,
                Password = password,
                ResidentType = residentType,
                Address = address,
                ProofOfResidencyPath = proofOfResidencyPath,
                Status = "pending",
                SubmittedAt = DateTime.UtcNow
            };

            _logger?.LogInformation("Creating registration: {Email}", email);
            await _repo.CreateRegistrationAsync(registration);
            _logger?.LogInformation("Registration created successfully");

            TempData["RegisterSuccess"] = "Registration submitted successfully. Your application is pending approval by the HOA administration. You will be notified via email once your account is approved.";
            return RedirectToAction("login");
        }

        // Forum APIs

        // Returns (blocked, message) describing whether the user may post/reply in the forums.
        private async Task<(bool blocked, string? message)> GetForumBlockAsync(string? username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return (false, null);

            var user = await _repo.GetByUsernameAsync(username);
            if (user is null)
                return (false, null);

            var reasonSuffix = string.IsNullOrWhiteSpace(user.BanReason) ? string.Empty : $" Reason: {user.BanReason}";

            // Permanent ban (flag set, no expiry)
            if (user.IsBanned && user.BannedUntil == null)
                return (true, $"You are banned from the community forums and cannot post or reply.{reasonSuffix}");

            // Active timeout (expiry in the future)
            if (user.BannedUntil.HasValue && user.BannedUntil.Value > DateTime.Now)
                return (true, $"You are timed out from the forums until {user.BannedUntil.Value:MMM d, yyyy h:mm tt}.{reasonSuffix}");

            return (false, null);
        }

        // GET /api/forums/my-status - current user's forum standing (for the notice banner)
        [HttpGet("/api/forums/my-status")]
        public async Task<IActionResult> GetMyForumStatus()
        {
            var username = HttpContext.Session.GetString("Username");
            var (blocked, message) = await GetForumBlockAsync(username);
            return Json(new { authenticated = !string.IsNullOrEmpty(username), blocked, message });
        }

        // POST /api/forums/users/{username}/ban - ban or timeout a user (staff/admin only)
        // Body: { durationHours: int|null (null = permanent), reason: string }
        [HttpPost("/api/forums/users/{username}/ban")]
        [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
        public async Task<IActionResult> BanForumUser(string username, [FromBody] ForumBanRequest? request)
        {
            DateTime? until = null;
            if (request?.DurationHours is int hours && hours > 0)
                until = DateTime.Now.AddHours(hours);

            var ok = await _repo.SetUserBanAsync(username, true, until, request?.Reason);
            if (!ok)
                return NotFound(new { success = false, error = "User not found" });

            var moderator = HttpContext.Session.GetString("Username") ?? "Staff";
            _logger?.LogInformation("Forum {Action} applied to {User} by {Moderator}", until == null ? "ban" : "timeout", username, moderator);
            return Json(new { success = true, banned = true, until });
        }

        // POST /api/forums/users/{username}/unban - lift ban/timeout (staff/admin only)
        [HttpPost("/api/forums/users/{username}/unban")]
        [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
        public async Task<IActionResult> UnbanForumUser(string username)
        {
            var ok = await _repo.SetUserBanAsync(username, false, null, null);
            if (!ok)
                return NotFound(new { success = false, error = "User not found" });

            _logger?.LogInformation("Forum ban lifted for {User}", username);
            return Json(new { success = true, banned = false });
        }

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
            var (blocked, blockMsg) = await GetForumBlockAsync(username);
            if (blocked)
            {
                _logger?.LogInformation("Blocked post attempt by banned/timed-out user {User}", username);
                return StatusCode(403, new { success = false, error = blockMsg });
            }
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
            var replyUser = HttpContext.Session.GetString("Username");
            var (replyBlocked, replyBlockMsg) = await GetForumBlockAsync(replyUser);
            if (replyBlocked)
            {
                _logger?.LogInformation("Blocked reply attempt by banned/timed-out user {User}", replyUser);
                return StatusCode(403, new { success = false, error = replyBlockMsg });
            }
            reply.PostId = id;
            reply.Name = replyUser ?? reply.Name ?? "Anonymous";
            reply.Date = System.DateTime.Now.ToString("MMM d, yyyy");
            _logger?.LogInformation("AddReply called by {User} on post {PostId}", reply.Name, id);
            var ok = await _repo.AddReplyAsync(reply);
            if (ok) _logger?.LogInformation("Reply added to post {PostId}", id);
            if (!ok) return NotFound();
            return Ok();
        }

        [HttpDelete("/api/forums/posts/{id}")]
        [WebApplication1.Filters.UserTypeAuthorize(2,3)]
        public async Task<IActionResult> DeletePost(int id)
        {
            var moderator = HttpContext.Session.GetString("Username") ?? "Staff";
            _logger?.LogInformation("DeletePost {PostId} by {Moderator}", id, moderator);
            var ok = await _repo.DeletePostAsync(id);
            if (!ok) return NotFound();
            return Ok(new { success = true });
        }

        [HttpDelete("/api/forums/replies/{id}")]
        [WebApplication1.Filters.UserTypeAuthorize(2,3)]
        public async Task<IActionResult> DeleteReply(int id)
        {
            var moderator = HttpContext.Session.GetString("Username") ?? "Staff";
            _logger?.LogInformation("DeleteReply {ReplyId} by {Moderator}", id, moderator);
            var ok = await _repo.DeleteReplyAsync(id);
            if (!ok) return NotFound();
            return Ok(new { success = true });
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

        [HttpPost("/api/concerns/report")]
        public async Task<IActionResult> SubmitConcernReport()
        {
            try
            {
                var form = Request.Form;
                var report = new ConcernReport();

                // Parse basic fields
                if (double.TryParse(form["latitude"].ToString(), out var lat))
                    report.Latitude = lat;
                if (double.TryParse(form["longitude"].ToString(), out var lon))
                    report.Longitude = lon;

                report.Description = form["description"].ToString();
                report.Category = form["category"].ToString();
                report.Address = form["address"].ToString();
                report.Street = form["street"].ToString();
                report.AdditionalLocation = form["additionalLocation"].ToString();
                report.Anonymous = form["anonymous"].ToString().ToLower() == "on" || form["anonymous"].ToString().ToLower() == "true";
                report.ReporterName = form["reporterName"].ToString();
                report.ReporterContact = form["reporterContact"].ToString();
                report.Timestamp = DateTime.Now;
                report.Status = "open";

                // Generate a short, meaningful reference: INC-YYMM-NNN
                // INC = Incident, YYMM = year+month, NNN = sequential number within that month.
                var now = DateTime.Now;
                var monthlyCount = await _repo.GetMonthlyReportCountAsync(now.Year, now.Month);
                report.Reference = $"INC-{now:yyMM}-{(monthlyCount + 1):D3}";

                // Handle photo upload
                var photoFile = Request.Form.Files.GetFile("photo");
                if (photoFile != null && photoFile.Length > 0)
                {
                    var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "reports");
                    if (!Directory.Exists(uploads))
                        Directory.CreateDirectory(uploads);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(photoFile.FileName);
                    var filePath = Path.Combine(uploads, fileName);

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await photoFile.CopyToAsync(stream);
                    }

                    report.Photo = $"/uploads/reports/{fileName}";
                }

                // Save to database
                var createdReport = await _repo.CreateReportAsync(report);

                // Run AI analysis inline (scoped services must remain in-scope)
                try
                {
                    var (keywordsWithSeverity, priority) = await _aiService.AnalyzeWithSeveritiesAsync(report.Description);
                    if (keywordsWithSeverity.Count > 0 || priority != "medium")
                    {
                        createdReport.Priority = priority;
                        createdReport.DetectedKeywords = string.Join(",", keywordsWithSeverity.Select(k => k.keyword));
                        await _repo.UpdateReportAsync(createdReport);

                        var existingKeywords = await _repo.GetActiveKeywordsAsync();
                        foreach (var (keyword, severity) in keywordsWithSeverity)
                        {
                            var exists = existingKeywords.Any(k => k.Keyword != null &&
                                k.Keyword.Equals(keyword, StringComparison.OrdinalIgnoreCase));
                            if (!exists)
                            {
                                await _repo.CreateKeywordAsync(new KeywordDictionary
                                {
                                    Keyword = keyword,
                                    Severity = severity,
                                    Category = "AI-Detected",
                                    Language = "bilingual",
                                    IsActive = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                });
                            }
                        }
                    }
                }
                catch (Exception aiEx)
                {
                    _logger?.LogWarning(aiEx, "AI analysis failed for report {Reference}, report was still saved", createdReport.Reference);
                }

                return Json(new { success = true, reference = createdReport.Reference, id = createdReport.Id,
                    priority = createdReport.Priority, keywords = createdReport.DetectedKeywords });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error submitting concern report");
                return Json(new { success = false, error = ex.Message });
            }
        }

        // GET /api/admin/recent-activities - aggregated live activity feed for the admin dashboard
        [HttpGet("/api/admin/recent-activities")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> GetRecentActivities()
        {
            var activities = new List<ActivityItem>();

            try
            {
                var registrations = await _repo.GetRegistrationsAsync();
                activities.AddRange(registrations.Select(r => new ActivityItem
                {
                    Type = "registration",
                    Icon = "fa-user-plus",
                    Color = "var(--navy)",
                    Text = $"New member registration from <em>{r.FullName}</em>",
                    Meta = r.Status,
                    Time = r.SubmittedAt
                }));

                var reports = await _repo.GetReportsAsync();
                activities.AddRange(reports.Select(c => new ActivityItem
                {
                    Type = "incident",
                    Icon = "fa-triangle-exclamation",
                    Color = "var(--red)",
                    Text = $"New report <strong>{c.Reference}</strong> filed by <em>{(c.Anonymous ? "Anonymous" : (string.IsNullOrWhiteSpace(c.ReporterName) ? "A resident" : c.ReporterName))}</em>",
                    Meta = c.Priority,
                    Time = c.Timestamp
                }));

                var posts = await _repo.GetPostsAsync();
                activities.AddRange(posts.Select(p => new ActivityItem
                {
                    Type = "forum",
                    Icon = "fa-comments",
                    Color = "var(--gold)",
                    Text = $"New forum post \"{p.Title}\" by <em>{p.Author}</em>",
                    Meta = p.Category,
                    Time = p.CreatedAt
                }));

                var reservations = await _repo.GetReservationsAsync();
                activities.AddRange(reservations.Select(v => new ActivityItem
                {
                    Type = "reservation",
                    Icon = "fa-calendar-check",
                    Color = "var(--green)",
                    Text = $"Reservation request for <strong>{v.Amenity}</strong> by <em>{v.ResidentName ?? "A resident"}</em>",
                    Meta = v.Status,
                    Time = v.SubmittedAt
                }));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error building recent activities feed");
                return Json(new { success = false, error = ex.Message });
            }

            var ordered = activities
                .OrderByDescending(a => a.Time)
                .Take(25)
                .ToList();

            return Json(new { success = true, data = ordered });
        }
    }

    public class ForumBanRequest
    {
        public int? DurationHours { get; set; } // null = permanent ban
        public string? Reason { get; set; }
    }

    public class ActivityItem
    {
        public string Type { get; set; } = "";
        public string Icon { get; set; } = "";
        public string Color { get; set; } = "";
        public string Text { get; set; } = "";
        public string Meta { get; set; } = "";
        public DateTime Time { get; set; }
    }
}