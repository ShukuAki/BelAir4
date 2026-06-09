using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;
using WebApplication1.Repository;
using WebApplication1.Services;
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
}