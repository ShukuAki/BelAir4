using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using WebApplication1.Models;
using WebApplication1.Repository;
using WebApplication1.Services;
using WebApplication1.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api")]
    public class ApiController : ControllerBase
    {
        private readonly IRepo _repo;
        private readonly IKeywordAnalysisService _keywordService;
        private readonly IAiAnalysisService _aiService;
        private readonly Microsoft.Extensions.Logging.ILogger<ApiController> _logger;

        public ApiController(IRepo repo, IKeywordAnalysisService keywordService, IAiAnalysisService aiService, Microsoft.Extensions.Logging.ILogger<ApiController> logger)
        {
            _repo = repo;
            _keywordService = keywordService;
            _aiService = aiService;
            _logger = logger;
        }

        // GET /api/keywords - Get all keywords
        [HttpGet("keywords")]
        public async Task<IActionResult> GetKeywords()
        {
            try
            {
                var keywords = await _repo.GetKeywordsAsync();
                return Ok(new { success = true, data = keywords });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting keywords");
                return StatusCode(500, new { success = false, error = "Failed to retrieve keywords" });
            }
        }

        // GET /api/keywords/active - Get only active keywords
        [HttpGet("keywords/active")]
        public async Task<IActionResult> GetActiveKeywords()
        {
            try
            {
                var keywords = await _repo.GetActiveKeywordsAsync();
                return Ok(new { success = true, data = keywords });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active keywords");
                return StatusCode(500, new { success = false, error = "Failed to retrieve active keywords" });
            }
        }

        // POST /api/keywords - Create a new keyword
        [HttpPost("keywords")]
        public async Task<IActionResult> CreateKeyword([FromBody] KeywordDictionary keyword)
        {
            if (keyword is null || string.IsNullOrWhiteSpace(keyword.Keyword))
                return BadRequest(new { success = false, error = "Keyword is required" });

            try
            {
                var created = await _repo.CreateKeywordAsync(keyword);
                return Ok(new { success = true, data = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating keyword");
                return StatusCode(500, new { success = false, error = "Failed to create keyword" });
            }
        }

        // PUT /api/keywords/{id} - Update a keyword
        [HttpPut("keywords/{id}")]
        public async Task<IActionResult> UpdateKeyword(int id, [FromBody] KeywordDictionary keyword)
        {
            if (keyword is null || id != keyword.Id)
                return BadRequest(new { success = false, error = "Invalid keyword data" });

            try
            {
                var updated = await _repo.UpdateKeywordAsync(keyword);
                if (!updated)
                    return NotFound(new { success = false, error = "Keyword not found" });

                return Ok(new { success = true, message = "Keyword updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating keyword");
                return StatusCode(500, new { success = false, error = "Failed to update keyword" });
            }
        }

        // DELETE /api/keywords/{id} - Delete a keyword
        [HttpDelete("keywords/{id}")]
        public async Task<IActionResult> DeleteKeyword(int id)
        {
            try
            {
                var deleted = await _repo.DeleteKeywordAsync(id);
                if (!deleted)
                    return NotFound(new { success = false, error = "Keyword not found" });

                return Ok(new { success = true, message = "Keyword deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting keyword");
                return StatusCode(500, new { success = false, error = "Failed to delete keyword" });
            }
        }

        // POST /api/analyze-priority - Analyze text and return priority (AI-first, dictionary fallback)
        [HttpPost("analyze-priority")]
        public async Task<IActionResult> AnalyzePriority([FromBody] dynamic request)
        {
            try
            {
                string? text = request?.description;
                if (string.IsNullOrWhiteSpace(text))
                    return BadRequest(new { success = false, error = "Description is required" });

                var (kwsWithSev, aiPriority) = await _aiService.AnalyzeWithSeveritiesAsync(text);

                string priority;
                List<string> matched;
                string source;

                if (kwsWithSev.Count > 0)
                {
                    priority = aiPriority;
                    matched = kwsWithSev.Select(k => k.keyword).ToList();
                    source = "ai";
                }
                else
                {
                    var keywords = await _repo.GetActiveKeywordsAsync();
                    priority = _keywordService.DeterminePriority(text, keywords);
                    matched = _keywordService.ExtractMatchedKeywords(text, keywords);
                    source = "dictionary";
                }

                return Ok(new
                {
                    success = true,
                    priority,
                    detectedKeywords = matched,
                    keywordsJoined = string.Join(", ", matched),
                    source
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing priority");
                return StatusCode(500, new { success = false, error = "Failed to analyze priority" });
            }
        }

        // GET /api/incidents - Get all incident reports sorted by priority
        [HttpGet("incidents")]
        public async Task<IActionResult> GetIncidents()
        {
            try
            {
                var reports = await _repo.GetReportsAsync();
                // Sort by priority (high > medium > low) and then by timestamp
                var sorted = reports
                    .OrderByDescending(r => _keywordService.CalculatePriorityScore(r.Priority ?? "medium"))
                    .ThenByDescending(r => r.Timestamp)
                    .ToList();

                return Ok(new { success = true, data = sorted });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting incidents");
                return StatusCode(500, new { success = false, error = "Failed to retrieve incidents" });
            }
        }

        // GET /api/incidents/{priority} - Get incidents by priority level
        [HttpGet("incidents/{priority}")]
        public async Task<IActionResult> GetIncidentsByPriority(string priority)
        {
            try
            {
                var reports = await _repo.GetReportsByPriorityAsync(priority);
                return Ok(new { success = true, data = reports });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting incidents by priority");
                return StatusCode(500, new { success = false, error = "Failed to retrieve incidents" });
            }
        }

        // POST /api/incidents/{id}/resolve - Mark an incident resolved (optionally with a comment)
        [HttpPost("incidents/{id}/resolve")]
        public async Task<IActionResult> ResolveIncident(int id, [FromBody] IncidentActionRequest? request)
        {
            try
            {
                var handledBy = HttpContext.Session.GetString("Username") ?? "Staff";
                var ok = await _repo.UpdateReportStatusAsync(id, "resolved", request?.Comment, handledBy);
                if (!ok)
                    return NotFound(new { success = false, error = "Incident not found" });

                return Ok(new { success = true, message = "Incident resolved", resolvedBy = handledBy });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving incident {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to resolve incident" });
            }
        }

        // POST /api/incidents/{id}/comment - Add/update a staff comment and optionally change status
        [HttpPost("incidents/{id}/comment")]
        public async Task<IActionResult> CommentIncident(int id, [FromBody] IncidentActionRequest request)
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Comment))
                return BadRequest(new { success = false, error = "Comment is required" });

            try
            {
                var handledBy = HttpContext.Session.GetString("Username") ?? "Staff";
                var status = string.IsNullOrWhiteSpace(request.Status) ? "in-progress" : request.Status;
                var ok = await _repo.UpdateReportStatusAsync(id, status, request.Comment, handledBy);
                if (!ok)
                    return NotFound(new { success = false, error = "Incident not found" });

                return Ok(new { success = true, message = "Comment saved", status });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error commenting on incident {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to save comment" });
            }
        }

        // GET /api/keyword-statistics - Get keyword usage statistics
        [HttpGet("keyword-statistics")]
        public async Task<IActionResult> GetKeywordStatistics()
        {
            try
            {
                var keywords = await _repo.GetActiveKeywordsAsync();
                var reports = await _repo.GetReportsAsync();

                // Count keyword occurrences in reports
                var stats = new List<dynamic>();
                foreach (var kw in keywords.Take(20))
                {
                    var count = reports.Count(r => !string.IsNullOrEmpty(r.DetectedKeywords) && r.DetectedKeywords.Contains(kw.Keyword ?? string.Empty, StringComparison.OrdinalIgnoreCase));
                    if (count > 0)
                    {
                        stats.Add(new
                        {
                            keyword = kw.Keyword,
                            severity = kw.Severity,
                            occurrences = count
                        });
                    }
                }

                return Ok(new { success = true, data = stats.OrderByDescending(s => s.occurrences) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting keyword statistics");
                return StatusCode(500, new { success = false, error = "Failed to retrieve statistics" });
            }
        }

        // GET /api/wordbank - Get combined word bank from dictionary, posts and reports
        [HttpGet("wordbank")]
        public async Task<IActionResult> GetWordBank()
        {
            try
            {
                var keywords = await _repo.GetActiveKeywordsAsync();
                var wordBank = new List<WordBankItem>();

                // Always include every active keyword from the dictionary table
                foreach (var kw in keywords)
                {
                    wordBank.Add(new WordBankItem
                    {
                        Type = kw.Category == "AI-Detected" ? "AI-Detected" : "Dictionary",
                        Source = kw.Category ?? "Manual",
                        Keyword = kw.Keyword ?? "",
                        Severity = kw.Severity ?? "medium",
                        Priority = kw.Severity ?? "medium",
                        Date = kw.UpdatedAt != default ? kw.UpdatedAt : kw.CreatedAt,
                        Author = "Staff",
                        Category = kw.Category ?? "-"
                    });
                }

                // Add extracted keywords from posts (isolated — schema may be pending migration)
                try
                {
                    var posts = await _repo.GetPostsAsync();
                    foreach (var post in posts.Where(p => !string.IsNullOrEmpty(p.DetectedKeywords)))
                    {
                        var keywordsList = post.DetectedKeywords!.Split(',').Select(k => k.Trim()).Where(k => !string.IsNullOrWhiteSpace(k));
                        foreach (var keyword in keywordsList)
                        {
                            if (wordBank.Any(w => w.Keyword.Equals(keyword, StringComparison.OrdinalIgnoreCase))) continue;
                            var kwData = keywords.FirstOrDefault(k => k.Keyword != null && k.Keyword.Equals(keyword, StringComparison.OrdinalIgnoreCase));
                            wordBank.Add(new WordBankItem
                            {
                                Type = "Post",
                                Source = post.Title ?? "Forum Post",
                                Keyword = keyword,
                                Severity = kwData?.Severity ?? "medium",
                                Priority = post.Priority ?? "medium",
                                Date = post.CreatedAt,
                                Author = post.Author ?? "-",
                                Category = post.Category ?? "-"
                            });
                        }
                    }
                }
                catch (Exception postEx)
                {
                    _logger.LogWarning(postEx, "Could not load posts for word bank (schema may need migration)");
                }

                // Add extracted keywords from reports (isolated — schema may be pending migration)
                try
                {
                    var reports = await _repo.GetReportsAsync();
                    foreach (var report in reports.Where(r => !string.IsNullOrEmpty(r.DetectedKeywords)))
                    {
                        var keywordsList = report.DetectedKeywords!.Split(',').Select(k => k.Trim()).Where(k => !string.IsNullOrWhiteSpace(k));
                        foreach (var keyword in keywordsList)
                        {
                            if (wordBank.Any(w => w.Keyword.Equals(keyword, StringComparison.OrdinalIgnoreCase))) continue;
                            var kwData = keywords.FirstOrDefault(k => k.Keyword != null && k.Keyword.Equals(keyword, StringComparison.OrdinalIgnoreCase));
                            wordBank.Add(new WordBankItem
                            {
                                Type = "Report",
                                Source = report.Reference ?? $"Report-{report.Id}",
                                Keyword = keyword,
                                Severity = kwData?.Severity ?? "medium",
                                Priority = report.Priority ?? "medium",
                                Date = report.Timestamp,
                                Author = report.ReporterName ?? "Anonymous",
                                Category = report.Category ?? "-"
                            });
                        }
                    }
                }
                catch (Exception reportEx)
                {
                    _logger.LogWarning(reportEx, "Could not load reports for word bank (schema may need migration)");
                }

                var severityOrder = new Dictionary<string, int> { { "high", 0 }, { "medium", 1 }, { "low", 2 } };
                var sorted = wordBank
                    .OrderBy(w => severityOrder.TryGetValue(w.Severity, out var o) ? o : 1)
                    .ThenByDescending(w => w.Date)
                    .ToList();

                return Ok(new { success = true, data = sorted, count = sorted.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting word bank");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // GET /api/posts/analysis - Get all posts with keyword analysis
        [HttpGet("posts/analysis")]
        public async Task<IActionResult> GetPostsWithAnalysis()
        {
            try
            {
                var posts = await _repo.GetPostsAsync();
                var keywords = await _repo.GetActiveKeywordsAsync();

                var analyzed = posts.Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Category,
                    p.Status,
                    p.Description,
                    p.Author,
                    p.Priority,
                    p.DetectedKeywords,
                    p.IsPublic,
                    p.CreatedAt,
                    ReplyCount = p.Replies?.Count ?? 0
                }).ToList();

                return Ok(new { success = true, data = analyzed });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting posts with analysis");
                return StatusCode(500, new { success = false, error = "Failed to retrieve posts" });
            }
        }

        // GET /api/posts/{priority} - Get posts by priority
        [HttpGet("posts/{priority}")]
        public async Task<IActionResult> GetPostsByPriority(string priority)
        {
            try
            {
                var posts = await _repo.GetPostsByPriorityAsync(priority);
                return Ok(new { success = true, data = posts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting posts by priority");
                return StatusCode(500, new { success = false, error = "Failed to retrieve posts" });
            }
        }

        // POST /api/posts/{id}/analyze - Analyze a post and extract keywords (AI-first, dictionary fallback)
        [HttpPost("posts/{id}/analyze")]
        public async Task<IActionResult> AnalyzePost(int id)
        {
            try
            {
                var post = await _repo.GetPostByIdAsync(id);
                if (post is null)
                    return NotFound(new { success = false, error = "Post not found" });

                var analysisText = $"{post.Title} {post.Description}";
                var (kwsWithSev, aiPriority) = await _aiService.AnalyzeWithSeveritiesAsync(analysisText);

                string priority;
                List<string> matched;
                string source;

                if (kwsWithSev.Count > 0)
                {
                    priority = aiPriority;
                    matched = kwsWithSev.Select(k => k.keyword).ToList();
                    source = "ai";
                }
                else
                {
                    var keywords = await _repo.GetActiveKeywordsAsync();
                    priority = _keywordService.DeterminePriority(analysisText, keywords);
                    matched = _keywordService.ExtractMatchedKeywords(analysisText, keywords);
                    source = "dictionary";
                }

                post.Priority = priority;
                post.DetectedKeywords = string.Join(", ", matched);

                var updated = await _repo.UpdatePostAsync(post);
                if (!updated)
                    return StatusCode(500, new { success = false, error = "Failed to update post" });

                return Ok(new
                {
                    success = true,
                    message = "Post analyzed successfully",
                    priority,
                    detectedKeywords = matched,
                    source
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing post");
                return StatusCode(500, new { success = false, error = "Failed to analyze post" });
            }
        }

        // GET /api/ai/status - Check if Ollama AI is available
        [HttpGet("ai/status")]
        public async Task<IActionResult> GetAiStatus()
        {
            var available = await _aiService.IsAvailableAsync();
            return Ok(new { available, engine = "Ollama", model = "mistral" });
        }

        // POST /api/ai/analyze - Analyze text with AI, optionally save discovered keywords
        [HttpPost("ai/analyze")]
        public async Task<IActionResult> AiAnalyze([FromBody] AiAnalyzeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Text))
                return BadRequest(new { success = false, error = "Text is required" });

            try
            {
                var (kwsWithSev, priority) = await _aiService.AnalyzeWithSeveritiesAsync(request.Text);

                int newKeywordsCount = 0;
                if (request.SaveKeywords && kwsWithSev.Count > 0)
                {
                    var existingKeywords = await _repo.GetActiveKeywordsAsync();
                    foreach (var (kw, sev) in kwsWithSev)
                        newKeywordsCount += await UpsertKeywordAsync(existingKeywords, kw, sev);
                }

                return Ok(new
                {
                    success = true,
                    priority,
                    keywords = kwsWithSev.Select(k => new { keyword = k.keyword, severity = k.severity }),
                    newKeywords = newKeywordsCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI analyze");
                return StatusCode(500, new { success = false, error = "AI analysis failed" });
            }
        }

        // POST /api/ai/analyze-all - Run AI analysis on all posts and reports, auto-save keywords
        [HttpPost("ai/analyze-all")]
        public async Task<IActionResult> AiAnalyzeAll()
        {
            try
            {
                var isAvailable = await _aiService.IsAvailableAsync();
                if (!isAvailable)
                    return Ok(new { success = false, error = "Ollama is not running. Start Ollama and try again." });

                var posts = await _repo.GetPostsAsync();
                var reports = await _repo.GetReportsAsync();
                var existingKeywords = await _repo.GetActiveKeywordsAsync();

                int processed = 0, newKeywordsCount = 0;

                foreach (var post in posts)
                {
                    var text = $"{post.Title} {post.Description}".Trim();
                    if (string.IsNullOrWhiteSpace(text)) continue;

                    var (kwsWithSev, priority) = await _aiService.AnalyzeWithSeveritiesAsync(text);
                    if (kwsWithSev.Count == 0) continue;

                    post.Priority = priority;
                    post.DetectedKeywords = string.Join(", ", kwsWithSev.Select(k => k.keyword));
                    await _repo.UpdatePostAsync(post);

                    foreach (var (kw, sev) in kwsWithSev)
                        newKeywordsCount += await UpsertKeywordAsync(existingKeywords, kw, sev);

                    processed++;
                }

                foreach (var report in reports)
                {
                    if (string.IsNullOrWhiteSpace(report.Description)) continue;

                    var (kwsWithSev, priority) = await _aiService.AnalyzeWithSeveritiesAsync(report.Description);
                    if (kwsWithSev.Count == 0) continue;

                    report.Priority = priority;
                    report.DetectedKeywords = string.Join(", ", kwsWithSev.Select(k => k.keyword));
                    await _repo.UpdateReportAsync(report);

                    foreach (var (kw, sev) in kwsWithSev)
                        newKeywordsCount += await UpsertKeywordAsync(existingKeywords, kw, sev);

                    processed++;
                }

                return Ok(new { success = true, processed, newKeywords = newKeywordsCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI analyze-all");
                return StatusCode(500, new { success = false, error = "AI analysis failed" });
            }
        }

        // GET /api/advertisements - Get approved advertisements (public)
        [HttpGet("advertisements")]
        public async Task<IActionResult> GetAdvertisements()
        {
            try
            {
                var ads = await _repo.GetApprovedAdvertisementsAsync();
                return Ok(new { success = true, data = ads });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advertisements");
                return StatusCode(500, new { success = false, error = "Failed to retrieve advertisements" });
            }
        }

        // POST /api/advertisements - Create new advertisement (pending status)
        [HttpPost("advertisements")]
        public async Task<IActionResult> CreateAdvertisement([FromBody] Advertisement ad)
        {
            try
            {
                var created = await _repo.CreateAdvertisementAsync(ad);
                return Ok(new { success = true, data = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating advertisement");
                return StatusCode(500, new { success = false, error = "Failed to create advertisement" });
            }
        }

        // GET /api/advertisements/pending - Get pending advertisements (staff only)
        [HttpGet("advertisements/pending")]
        public async Task<IActionResult> GetPendingAdvertisements()
        {
            try
            {
                var ads = await _repo.GetPendingAdvertisementsAsync();
                return Ok(new { success = true, data = ads });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending advertisements");
                return StatusCode(500, new { success = false, error = "Failed to retrieve pending advertisements" });
            }
        }

        // POST /api/advertisements/{id}/approve - Approve advertisement (staff only)
        [HttpPost("advertisements/{id}/approve")]
        public async Task<IActionResult> ApproveAdvertisement(int id, [FromBody] ApproveRejectRequest request)
        {
            try
            {
                var success = await _repo.ApproveAdvertisementAsync(id, request.ReviewedBy ?? "Staff");
                if (!success)
                    return NotFound(new { success = false, error = "Advertisement not found" });
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving advertisement");
                return StatusCode(500, new { success = false, error = "Failed to approve advertisement" });
            }
        }

        // POST /api/advertisements/{id}/reject - Reject advertisement (staff only)
        [HttpPost("advertisements/{id}/reject")]
        public async Task<IActionResult> RejectAdvertisement(int id, [FromBody] ApproveRejectRequest request)
        {
            try
            {
                var success = await _repo.RejectAdvertisementAsync(id, request.ReviewedBy ?? "Staff");
                if (!success)
                    return NotFound(new { success = false, error = "Advertisement not found" });
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting advertisement");
                return StatusCode(500, new { success = false, error = "Failed to reject advertisement" });
            }
        }

        // ═══════════════════════════════════════════════════
        //  STAFF ENDPOINTS  (UserType = 2 or 3)
        // ═══════════════════════════════════════════════════

        // GET /api/staff/stats - dashboard summary counts for staff
        [HttpGet("staff/stats")]
        [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
        public async Task<IActionResult> GetStaffStats()
        {
            try
            {
                var pendingReg   = await _repo.GetPendingRegistrationsAsync();
                var approvedReg  = await _repo.GetApprovedRegistrationsAsync();
                var reports      = await _repo.GetReportsAsync();
                var pendingAds   = await _repo.GetPendingAdvertisementsAsync();
                var reservations = await _repo.GetReservationsAsync();
                var posts        = await _repo.GetPostsAsync();

                return Ok(new
                {
                    success              = true,
                    verifiedResidents    = approvedReg.Count,
                    pendingRegistrations = pendingReg.Count,
                    openIncidents        = reports.Count(r => (r.Status ?? "open") == "open"),
                    pendingAds           = pendingAds.Count,
                    pendingReservations  = reservations.Count(r => (r.Status ?? "pending").ToLower() == "pending"),
                    forumPosts           = posts.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff stats");
                return StatusCode(500, new { success = false, error = "Failed to get staff stats" });
            }
        }

        // ═══════════════════════════════════════════════════
        //  ADMIN-ONLY ENDPOINTS  (UserType = 3)
        // ═══════════════════════════════════════════════════

        // GET /api/admin/stats
        [HttpGet("admin/stats")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> GetAdminStats()
        {
            try
            {
                var users         = await _repo.GetAllAsync();
                var reports       = await _repo.GetReportsAsync();
                var registrations = await _repo.GetRegistrationsAsync();
                var reservations  = await _repo.GetReservationsAsync();

                return Ok(new
                {
                    success              = true,
                    totalResidents       = users.Count(u => u.Type == 1),
                    totalStaff           = users.Count(u => u.Type >= 2),
                    bannedUsers          = users.Count(u => u.IsBanned && u.Type == 1),
                    pendingRegistrations = registrations.Count(r => r.Status == "pending"),
                    openIncidents        = reports.Count(r => r.Status == "open" || r.Status == "in-progress"),
                    resolvedIncidents    = reports.Count(r => r.Status == "resolved"),
                    pendingReservations  = reservations.Count(r => r.Status == "pending")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin stats");
                return StatusCode(500, new { success = false, error = "Failed to retrieve stats" });
            }
        }

        // GET /api/admin/staff
        [HttpGet("admin/staff")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> GetStaff()
        {
            try
            {
                var all   = await _repo.GetAllAsync();
                var staff = all
                    .Where(u => u.Type >= 2)
                    .Select(u => new
                    {
                        id     = u.Id,
                        name   = u.Username,
                        email  = u.Username,
                        role   = u.Type == 3 ? "Admin" : "Staff",
                        status = u.IsBanned ? "Suspended" : "Active"
                    }).ToList();
                return Ok(new { success = true, data = staff });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting staff list");
                return StatusCode(500, new { success = false, error = "Failed to retrieve staff" });
            }
        }

        // POST /api/admin/staff
        [HttpPost("admin/staff")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Email))
                return BadRequest(new { success = false, error = "Email is required" });

            try
            {
                var all = await _repo.GetAllAsync();
                if (all.Any(u => u.Username.Equals(req.Email.Trim(), StringComparison.OrdinalIgnoreCase)))
                    return Conflict(new { success = false, error = "An account with that email already exists" });

                var user = new UserAccount
                {
                    Username = req.Email.Trim().ToLower(),
                    Password = string.IsNullOrWhiteSpace(req.TempPassword) ? "Welcome@123" : req.TempPassword,
                    Type     = 2
                };
                var created = await _repo.CreateAsync(user);
                _logger.LogInformation("Admin created staff account: {Email}", user.Username);
                return Ok(new
                {
                    success = true,
                    data    = new { id = created.Id, name = created.Username, email = created.Username, role = "Staff", status = "Active" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating staff account");
                return StatusCode(500, new { success = false, error = "Failed to create staff account" });
            }
        }

        // PUT /api/admin/staff/{id}
        [HttpPut("admin/staff/{id}")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffRequest req)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user is null || user.Type < 2)
                    return NotFound(new { success = false, error = "Staff account not found" });

                if (!string.IsNullOrWhiteSpace(req?.Email))
                    user.Username = req.Email.Trim().ToLower();
                if (!string.IsNullOrWhiteSpace(req?.Status))
                    user.IsBanned = req.Status.Equals("Suspended", StringComparison.OrdinalIgnoreCase);

                var ok = await _repo.UpdateAsync(user);
                return ok ? Ok(new { success = true }) : NotFound(new { success = false, error = "Staff not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating staff {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to update staff account" });
            }
        }

        // DELETE /api/admin/staff/{id}
        [HttpDelete("admin/staff/{id}")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user is null || user.Type < 2)
                    return NotFound(new { success = false, error = "Staff account not found" });

                var currentId = HttpContext.Session.GetInt32("UserId");
                if (currentId.HasValue && currentId.Value == id)
                    return BadRequest(new { success = false, error = "You cannot delete your own account" });

                var ok = await _repo.DeleteAsync(id);
                return ok ? Ok(new { success = true }) : NotFound(new { success = false, error = "Staff not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting staff {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to delete staff account" });
            }
        }

        // GET /api/admin/residents
        [HttpGet("admin/residents")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> GetAllResidents()
        {
            try
            {
                var users         = await _repo.GetAllAsync();
                var registrations = await _repo.GetRegistrationsAsync();

                var residents = users
                    .Where(u => u.Type == 1)
                    .Select(u =>
                    {
                        var reg    = registrations.FirstOrDefault(r =>
                            r.Email.Equals(u.Username, StringComparison.OrdinalIgnoreCase));
                        var status = u.IsBanned ? "Banned" :
                                     reg?.Status == "approved" ? "Verified" : "Pending";
                        return new
                        {
                            id        = u.Id,
                            name      = reg?.FullName ?? u.Username,
                            email     = u.Username,
                            contact   = reg?.Mobile   ?? "—",
                            address   = reg?.Address  ?? "—",
                            status,
                            banReason = u.BanReason
                        };
                    }).ToList();

                return Ok(new { success = true, data = residents });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting residents");
                return StatusCode(500, new { success = false, error = "Failed to retrieve residents" });
            }
        }

        // POST /api/admin/residents/{id}/ban
        [HttpPost("admin/residents/{id}/ban")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> BanResidentAccount(int id, [FromBody] AdminBanRequest? req)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user is null || user.Type != 1)
                    return NotFound(new { success = false, error = "Resident account not found" });

                var ok = await _repo.SetUserBanAsync(user.Username, true, null, req?.Reason ?? "Admin action");
                _logger.LogInformation("Admin banned resident {Username}", user.Username);
                return ok ? Ok(new { success = true }) : NotFound(new { success = false, error = "Account not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning resident {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to ban resident" });
            }
        }

        // POST /api/admin/residents/{id}/unban
        [HttpPost("admin/residents/{id}/unban")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> UnbanResidentAccount(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user is null || user.Type != 1)
                    return NotFound(new { success = false, error = "Resident account not found" });

                var ok = await _repo.SetUserBanAsync(user.Username, false, null, null);
                _logger.LogInformation("Admin unbanned resident {Username}", user.Username);
                return ok ? Ok(new { success = true }) : NotFound(new { success = false, error = "Account not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning resident {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to unban resident" });
            }
        }

        // DELETE /api/admin/residents/{id}
        [HttpDelete("admin/residents/{id}")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> DeleteResidentAccount(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user is null || user.Type != 1)
                    return NotFound(new { success = false, error = "Resident account not found" });

                var ok = await _repo.DeleteAsync(id);
                return ok ? Ok(new { success = true }) : NotFound(new { success = false, error = "Account not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting resident {Id}", id);
                return StatusCode(500, new { success = false, error = "Failed to delete resident" });
            }
        }

        // GET /api/admin/export/{dataset}  —  returns a CSV file download
        [HttpGet("admin/export/{dataset}")]
        [WebApplication1.Filters.UserTypeAuthorize(3)]
        public async Task<IActionResult> ExportDataset(string dataset)
        {
            try
            {
                var sb   = new System.Text.StringBuilder();
                var slug = DateTime.Now.ToString("yyyyMMdd");
                string filename;

                switch (dataset.ToLowerInvariant().Replace("-", "_").Replace(" ", "_"))
                {
                    case "residents":
                    case "resident_directory":
                    {
                        var users = await _repo.GetAllAsync();
                        var regs  = await _repo.GetRegistrationsAsync();
                        sb.AppendLine("ID,Email,FullName,Contact,Address,Status");
                        foreach (var u in users.Where(u => u.Type == 1))
                        {
                            var reg    = regs.FirstOrDefault(r => r.Email.Equals(u.Username, StringComparison.OrdinalIgnoreCase));
                            var status = u.IsBanned ? "Banned" : reg?.Status == "approved" ? "Verified" : "Pending";
                            sb.AppendLine(ToCsvRow(u.Id.ToString(), u.Username, reg?.FullName ?? "", reg?.Mobile ?? "", reg?.Address ?? "", status));
                        }
                        filename = $"residents_{slug}.csv";
                        break;
                    }
                    case "incidents":
                    case "incident_reports":
                    {
                        var reports = await _repo.GetReportsAsync();
                        sb.AppendLine("ID,Reference,Category,Priority,Status,Reporter,Location,Date,ResolvedBy");
                        foreach (var r in reports)
                            sb.AppendLine(ToCsvRow(r.Id.ToString(), r.Reference ?? "", r.Category ?? "", r.Priority ?? "medium", r.Status ?? "open", r.Anonymous ? "Anonymous" : r.ReporterName ?? "Anonymous", r.Address ?? "", r.Timestamp.ToString("yyyy-MM-dd"), r.ResolvedBy ?? ""));
                        filename = $"incidents_{slug}.csv";
                        break;
                    }
                    case "audit":
                    case "audit_log":
                    {
                        var acts = await BuildAuditListAsync();
                        sb.AppendLine("Timestamp,Type,Description,Meta");
                        foreach (var a in acts)
                            sb.AppendLine(ToCsvRow(a.Time.ToString("yyyy-MM-dd HH:mm:ss"), a.Type, a.Text, a.Meta));
                        filename = $"audit_log_{slug}.csv";
                        break;
                    }
                    case "staff":
                    case "staff_activity":
                    {
                        var all = await _repo.GetAllAsync();
                        sb.AppendLine("ID,Email,Role,Status");
                        foreach (var u in all.Where(u => u.Type >= 2))
                            sb.AppendLine(ToCsvRow(u.Id.ToString(), u.Username, u.Type == 3 ? "Admin" : "Staff", u.IsBanned ? "Suspended" : "Active"));
                        filename = $"staff_activity_{slug}.csv";
                        break;
                    }
                    default:
                        return BadRequest(new { success = false, error = "Unknown dataset: " + dataset });
                }

                var bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
                return File(bytes, "text/csv; charset=utf-8", filename);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting {Dataset}", dataset);
                return StatusCode(500, new { success = false, error = "Export failed" });
            }
        }

        private static string ToCsvRow(params string[] fields) =>
            string.Join(",", fields.Select(f =>
            {
                if (string.IsNullOrEmpty(f)) return "";
                f = System.Text.RegularExpressions.Regex.Replace(f, "<[^>]+>", "");
                return f.IndexOfAny(new[] { ',', '"', '\n', '\r' }) >= 0
                    ? $"\"{f.Replace("\"", "\"\"")}\""
                    : f;
            }));

        private async Task<List<ActivityItem>> BuildAuditListAsync()
        {
            var list = new List<ActivityItem>();
            try
            {
                var reports = await _repo.GetReportsAsync();
                list.AddRange(reports.Select(r => new ActivityItem
                {
                    Type = "incident", Icon = "fa-exclamation-circle", Color = "var(--red)",
                    Text = $"Report {r.Reference} filed by {(r.Anonymous ? "Anonymous" : r.ReporterName ?? "resident")}",
                    Meta = r.Priority ?? "medium", Time = r.Timestamp
                }));
                var posts = await _repo.GetPostsAsync();
                list.AddRange(posts.Select(p => new ActivityItem
                {
                    Type = "forum", Icon = "fa-comments", Color = "var(--gold)",
                    Text = $"Forum post: {p.Title} by {p.Author}",
                    Meta = p.Category ?? "-", Time = p.CreatedAt
                }));
                var regs = await _repo.GetRegistrationsAsync();
                list.AddRange(regs.Select(r => new ActivityItem
                {
                    Type = "registration", Icon = "fa-user-plus", Color = "var(--navy)",
                    Text = $"Registration: {r.FullName} ({r.Email})",
                    Meta = r.Status ?? "pending", Time = r.SubmittedAt
                }));
            }
            catch { }
            return list.OrderByDescending(a => a.Time).ToList();
        }

        private async Task<int> UpsertKeywordAsync(List<KeywordDictionary> existingKeywords, string kw, string sev)
        {
            var existing = existingKeywords.FirstOrDefault(k =>
                k.Keyword != null && k.Keyword.Equals(kw, StringComparison.OrdinalIgnoreCase));

            if (existing == null)
            {
                await _repo.CreateKeywordAsync(new KeywordDictionary
                {
                    Keyword = kw,
                    Severity = sev,
                    Category = "AI-Detected",
                    Language = "bilingual",
                    IsActive = true
                });
                existingKeywords.Add(new KeywordDictionary { Keyword = kw, Severity = sev, IsActive = true });
                return 1;
            }

            if (existing.Severity != sev)
            {
                existing.Severity = sev;
                await _repo.UpdateKeywordAsync(existing);
            }
            return 0;
        }
    }

    public class AiAnalyzeRequest
    {
        public string? Text { get; set; }
        public bool SaveKeywords { get; set; } = true;
    }

    public class WordBankItem
    {
        public string Type { get; set; } = "";
        public string Source { get; set; } = "";
        public string Keyword { get; set; } = "";
        public string Severity { get; set; } = "medium";
        public string Priority { get; set; } = "medium";
        public DateTime Date { get; set; }
        public string Author { get; set; } = "";
        public string Category { get; set; } = "";
    }

    public class ApproveRejectRequest
    {
        public string? ReviewedBy { get; set; }
    }

    public class IncidentActionRequest
    {
        public string? Comment { get; set; }
        public string? Status { get; set; } // "open", "in-progress", "resolved"
    }

    public class CreateStaffRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? TempPassword { get; set; }
    }

    public class UpdateStaffRequest
    {
        public string? Email { get; set; }
        public string? Status { get; set; } // "Active" or "Suspended"
    }

    public class AdminBanRequest
    {
        public string? Reason { get; set; }
    }

    // DTO helpers used by content-management endpoints
    public class AnnouncementRequest { public string? Title{get;set;} public string? Body{get;set;} public string? Category{get;set;} public string? PostedBy{get;set;} public string? Status{get;set;} public DateTime? ScheduledAt{get;set;} }
    public class EventRequest { public string? Title{get;set;} public string? Description{get;set;} public string? Date{get;set;} public string? Time{get;set;} public string? Location{get;set;} public string? Category{get;set;} public string? CreatedBy{get;set;} }
    public class BodMemberRequest { public string? Name{get;set;} public string? Position{get;set;} public string? Term{get;set;} public string? Phone{get;set;} public string? Email{get;set;} }
    public class MeetingRecordRequest { public string? Title{get;set;} public string? Date{get;set;} public string? Type{get;set;} public string? UploadedBy{get;set;} }
    public class DocumentRequest { public string? Name{get;set;} public string? Category{get;set;} public string? UploadedBy{get;set;} }
    public class ContactRequest { public string? Name{get;set;} public string? Role{get;set;} public string? Phone{get;set;} public string? Email{get;set;} }
}

// ═══════════════════════════════════════════════════════════
//  CONTENT-MANAGEMENT API  — Announcements, Events, BODs,
//  Meeting Records, Documents, Contacts  (UserType = 2 or 3)
// ═══════════════════════════════════════════════════════════
[ApiController]
[Route("api")]
public class ContentApiController : ControllerBase
{
    private readonly WebApplication1.Repository.IRepo _repo;
    private readonly Microsoft.Extensions.Logging.ILogger<ContentApiController> _logger;

    public ContentApiController(WebApplication1.Repository.IRepo repo, Microsoft.Extensions.Logging.ILogger<ContentApiController> logger)
    { _repo = repo; _logger = logger; }

    // ── Announcements ─────────────────────────────────────────
    [HttpGet("announcements")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetAnnouncements()
    {
        try { return Ok(new { success = true, data = await _repo.GetAnnouncementsAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetAnnouncements"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("announcements")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementRequest req)
    {
        try {
            var a = new WebApplication1.Models.Announcement { Title = req.Title ?? "", Body = req.Body, Category = req.Category, PostedBy = req.PostedBy, Status = req.Status ?? "published", ScheduledAt = req.ScheduledAt };
            return Ok(new { success = true, data = await _repo.CreateAnnouncementAsync(a) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateAnnouncement"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPut("announcements/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] AnnouncementRequest req)
    {
        try {
            var a = new WebApplication1.Models.Announcement { Id = id, Title = req.Title ?? "", Body = req.Body, Category = req.Category, PostedBy = req.PostedBy, Status = req.Status ?? "published", ScheduledAt = req.ScheduledAt };
            return Ok(new { success = await _repo.UpdateAnnouncementAsync(a) });
        } catch (Exception ex) { _logger.LogError(ex, "UpdateAnnouncement"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("announcements/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        try { return Ok(new { success = await _repo.DeleteAnnouncementAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteAnnouncement"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    // ── Events ────────────────────────────────────────────────
    [HttpGet("hoa-events")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetEvents()
    {
        try { return Ok(new { success = true, data = await _repo.GetEventsAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetEvents"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("hoa-events")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateEvent([FromBody] EventRequest req)
    {
        try {
            var e = new WebApplication1.Models.HoaEvent { Title = req.Title ?? "", Description = req.Description, Date = req.Date ?? "", Time = req.Time, Location = req.Location, Category = req.Category, CreatedBy = req.CreatedBy };
            return Ok(new { success = true, data = await _repo.CreateEventAsync(e) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateEvent"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPut("hoa-events/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] EventRequest req)
    {
        try {
            var e = new WebApplication1.Models.HoaEvent { Id = id, Title = req.Title ?? "", Description = req.Description, Date = req.Date ?? "", Time = req.Time, Location = req.Location, Category = req.Category, CreatedBy = req.CreatedBy };
            return Ok(new { success = await _repo.UpdateEventAsync(e) });
        } catch (Exception ex) { _logger.LogError(ex, "UpdateEvent"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("hoa-events/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        try { return Ok(new { success = await _repo.DeleteEventAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteEvent"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    // ── BOD Members ───────────────────────────────────────────
    [HttpGet("bod-members")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetBodMembers()
    {
        try { return Ok(new { success = true, data = await _repo.GetBodMembersAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetBodMembers"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("bod-members")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateBodMember([FromBody] BodMemberRequest req)
    {
        try {
            var m = new WebApplication1.Models.BodMember { Name = req.Name ?? "", Position = req.Position, Term = req.Term, Phone = req.Phone, Email = req.Email };
            return Ok(new { success = true, data = await _repo.CreateBodMemberAsync(m) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateBodMember"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPut("bod-members/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> UpdateBodMember(int id, [FromBody] BodMemberRequest req)
    {
        try {
            var m = new WebApplication1.Models.BodMember { Id = id, Name = req.Name ?? "", Position = req.Position, Term = req.Term, Phone = req.Phone, Email = req.Email };
            return Ok(new { success = await _repo.UpdateBodMemberAsync(m) });
        } catch (Exception ex) { _logger.LogError(ex, "UpdateBodMember"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("bod-members/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteBodMember(int id)
    {
        try { return Ok(new { success = await _repo.DeleteBodMemberAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteBodMember"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    // ── Meeting Records ───────────────────────────────────────
    [HttpGet("meeting-records")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetMeetingRecords()
    {
        try { return Ok(new { success = true, data = await _repo.GetMeetingRecordsAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetMeetingRecords"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("meeting-records")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateMeetingRecord([FromBody] MeetingRecordRequest req)
    {
        try {
            var r = new WebApplication1.Models.MeetingRecord { Title = req.Title ?? "", Date = req.Date, Type = req.Type, UploadedBy = req.UploadedBy };
            return Ok(new { success = true, data = await _repo.CreateMeetingRecordAsync(r) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateMeetingRecord"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPut("meeting-records/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> UpdateMeetingRecord(int id, [FromBody] MeetingRecordRequest req)
    {
        try {
            var r = new WebApplication1.Models.MeetingRecord { Id = id, Title = req.Title ?? "", Date = req.Date, Type = req.Type, UploadedBy = req.UploadedBy };
            return Ok(new { success = await _repo.UpdateMeetingRecordAsync(r) });
        } catch (Exception ex) { _logger.LogError(ex, "UpdateMeetingRecord"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("meeting-records/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteMeetingRecord(int id)
    {
        try { return Ok(new { success = await _repo.DeleteMeetingRecordAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteMeetingRecord"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    // ── Documents ─────────────────────────────────────────────
    [HttpGet("hoa-documents")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetDocuments()
    {
        try { return Ok(new { success = true, data = await _repo.GetDocumentsAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetDocuments"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("hoa-documents")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateDocument([FromBody] DocumentRequest req)
    {
        try {
            var d = new WebApplication1.Models.HoaDocument { Name = req.Name ?? "", Category = req.Category, UploadedBy = req.UploadedBy };
            return Ok(new { success = true, data = await _repo.CreateDocumentAsync(d) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateDocument"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("hoa-documents/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        try { return Ok(new { success = await _repo.DeleteDocumentAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteDocument"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    // ── Contacts ──────────────────────────────────────────────
    [HttpGet("contacts")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> GetContacts()
    {
        try { return Ok(new { success = true, data = await _repo.GetContactsAsync() }); }
        catch (Exception ex) { _logger.LogError(ex, "GetContacts"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("contacts")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> CreateContact([FromBody] ContactRequest req)
    {
        try {
            var c = new WebApplication1.Models.Contact { Name = req.Name ?? "", Role = req.Role, Phone = req.Phone, Email = req.Email };
            return Ok(new { success = true, data = await _repo.CreateContactAsync(c) });
        } catch (Exception ex) { _logger.LogError(ex, "CreateContact"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPut("contacts/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> UpdateContact(int id, [FromBody] ContactRequest req)
    {
        try {
            var c = new WebApplication1.Models.Contact { Id = id, Name = req.Name ?? "", Role = req.Role, Phone = req.Phone, Email = req.Email };
            return Ok(new { success = await _repo.UpdateContactAsync(c) });
        } catch (Exception ex) { _logger.LogError(ex, "UpdateContact"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpDelete("contacts/{id}")]
    [WebApplication1.Filters.UserTypeAuthorize(2, 3)]
    public async Task<IActionResult> DeleteContact(int id)
    {
        try { return Ok(new { success = await _repo.DeleteContactAsync(id) }); }
        catch (Exception ex) { _logger.LogError(ex, "DeleteContact"); return StatusCode(500, new { success = false, error = ex.Message }); }
    }
}