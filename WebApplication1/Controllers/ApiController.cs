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
        private readonly Microsoft.Extensions.Logging.ILogger<ApiController> _logger;

        public ApiController(IRepo repo, IKeywordAnalysisService keywordService, Microsoft.Extensions.Logging.ILogger<ApiController> logger)
        {
            _repo = repo;
            _keywordService = keywordService;
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

        // POST /api/analyze-priority - Analyze text and return priority
        [HttpPost("analyze-priority")]
        public async Task<IActionResult> AnalyzePriority([FromBody] dynamic request)
        {
            try
            {
                string? text = request?.description;
                if (string.IsNullOrWhiteSpace(text))
                    return BadRequest(new { success = false, error = "Description is required" });

                var keywords = await _repo.GetActiveKeywordsAsync();
                var priority = _keywordService.DeterminePriority(text, keywords);
                var matched = _keywordService.ExtractMatchedKeywords(text, keywords);

                return Ok(new
                {
                    success = true,
                    priority = priority,
                    detectedKeywords = matched,
                    keywordsJoined = string.Join(", ", matched)
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

        // GET /api/wordbank - Get combined word bank from posts and reports
        [HttpGet("wordbank")]
        public async Task<IActionResult> GetWordBank()
        {
            try
            {
                var posts = await _repo.GetPostsAsync();
                var reports = await _repo.GetReportsAsync();
                var keywords = await _repo.GetActiveKeywordsAsync();

                var wordBank = new List<dynamic>();

                // Add detected keywords from posts
                foreach (var post in posts.Where(p => !string.IsNullOrEmpty(p.DetectedKeywords)))
                {
                    var keywordsList = post.DetectedKeywords.Split(',').Select(k => k.Trim()).ToList();
                    foreach (var keyword in keywordsList)
                    {
                        var kwData = keywords.FirstOrDefault(k => k.Keyword == keyword);
                        wordBank.Add(new
                        {
                            type = "Post",
                            source = post.Title,
                            keyword = keyword,
                            severity = kwData?.Severity ?? "medium",
                            priority = post.Priority,
                            date = post.CreatedAt,
                            author = post.Author,
                            category = post.Category
                        });
                    }
                }

                // Add detected keywords from reports
                foreach (var report in reports.Where(r => !string.IsNullOrEmpty(r.DetectedKeywords)))
                {
                    var keywordsList = report.DetectedKeywords.Split(',').Select(k => k.Trim()).ToList();
                    foreach (var keyword in keywordsList)
                    {
                        var kwData = keywords.FirstOrDefault(k => k.Keyword == keyword);
                        wordBank.Add(new
                        {
                            type = "Report",
                            source = report.Reference ?? $"Report-{report.Id}",
                            keyword = keyword,
                            severity = kwData?.Severity ?? "medium",
                            priority = report.Priority,
                            date = report.Timestamp,
                            author = report.ReporterName ?? "Anonymous",
                            category = report.Category
                        });
                    }
                }

                // Sort by severity and date
                var severityOrder = new Dictionary<string, int> { { "high", 0 }, { "medium", 1 }, { "low", 2 } };
                var sorted = wordBank
                    .OrderBy(w => severityOrder.ContainsKey(w.severity) ? severityOrder[w.severity] : 1)
                    .ThenByDescending(w => w.date)
                    .ToList();

                return Ok(new { success = true, data = sorted, count = sorted.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting word bank");
                return StatusCode(500, new { success = false, error = "Failed to retrieve word bank" });
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

        // POST /api/posts/{id}/analyze - Analyze a post and extract keywords
        [HttpPost("posts/{id}/analyze")]
        public async Task<IActionResult> AnalyzePost(int id)
        {
            try
            {
                var post = await _repo.GetPostByIdAsync(id);
                if (post is null)
                    return NotFound(new { success = false, error = "Post not found" });

                var keywords = await _repo.GetActiveKeywordsAsync();
                var analysisText = $"{post.Title} {post.Description}";
                var priority = _keywordService.DeterminePriority(analysisText, keywords);
                var matched = _keywordService.ExtractMatchedKeywords(analysisText, keywords);

                post.Priority = priority;
                post.DetectedKeywords = string.Join(", ", matched);

                var updated = await _repo.UpdatePostAsync(post);
                if (!updated)
                    return StatusCode(500, new { success = false, error = "Failed to update post" });

                return Ok(new
                {
                    success = true,
                    message = "Post analyzed successfully",
                    priority = priority,
                    detectedKeywords = matched
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing post");
                return StatusCode(500, new { success = false, error = "Failed to analyze post" });
            }
        }
    }
}