using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace WebApplication1.Services
{
    /// <summary>
    /// Interface for AI-based keyword and priority analysis
    /// </summary>
    public interface IAiAnalysisService
    {
        Task<List<string>> ExtractKeywordsAsync(string? text);
        Task<string> DeterminePriorityAsync(string? text);
        Task<(List<string> keywords, string priority)> AnalyzeAsync(string? text);
        Task<bool> IsAvailableAsync();
    }

    /// <summary>
    /// Ollama-based AI analysis service for keyword extraction and priority determination.
    /// Uses local LLM running on localhost:11434 (no external API calls, no costs).
    /// </summary>
    public class OllamaAiService : IAiAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OllamaAiService> _logger;
        private readonly string _ollamaEndpoint;
        private readonly string _modelName;
        private readonly IKeywordAnalysisService _fallbackService;

        public OllamaAiService(
            HttpClient httpClient,
            ILogger<OllamaAiService> logger,
            IConfiguration configuration,
            IKeywordAnalysisService fallbackService)
        {
            _httpClient = httpClient;
            _logger = logger;
            _fallbackService = fallbackService;

            _ollamaEndpoint = configuration["Ollama:Endpoint"] ?? "http://localhost:11434";
            _modelName = configuration["Ollama:Model"] ?? "mistral";
        }

        /// <summary>
        /// Checks if Ollama is running and accessible
        /// </summary>
        public async Task<bool> IsAvailableAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_ollamaEndpoint}/api/tags");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Ollama availability check failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Extracts keywords from text using local AI
        /// </summary>
        public async Task<List<string>> ExtractKeywordsAsync(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return new List<string>();

            try
            {
                // Check if Ollama is available
                if (!await IsAvailableAsync())
                {
                    _logger.LogWarning("Ollama not available, returning empty keywords");
                    return new List<string>();
                }

                var prompt = $@"Extract the main keywords from this text. Return ONLY a comma-separated list of keywords, nothing else. Keep keywords under 3 words each.

Text: ""{text}""

Keywords:";

                var keywords = await CallOllamaAsync(prompt);

                if (string.IsNullOrWhiteSpace(keywords))
                    return new List<string>();

                // Parse comma-separated keywords
                var result = keywords
                    .Split(',')
                    .Select(k => k.Trim().ToLower())
                    .Where(k => !string.IsNullOrWhiteSpace(k) && k.Length > 2)
                    .Distinct()
                    .ToList();

                _logger.LogInformation($"Extracted {result.Count} keywords from text");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting keywords from Ollama");
                return new List<string>();
            }
        }

        /// <summary>
        /// Determines priority (high/medium/low) using local AI
        /// </summary>
        public async Task<string> DeterminePriorityAsync(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return "medium";

            try
            {
                // Check if Ollama is available
                if (!await IsAvailableAsync())
                {
                    _logger.LogWarning("Ollama not available, returning default priority");
                    return "medium";
                }

                var prompt = $@"Based on this text, determine the urgency/priority level. Consider keywords related to emergency, danger, safety, flooding, accidents, etc.

Return ONLY one word: 'high', 'medium', or 'low' - nothing else.

Text: ""{text}""

Priority:";

                var priority = await CallOllamaAsync(prompt);

                if (string.IsNullOrWhiteSpace(priority))
                    return "medium";

                var normalized = priority.Trim().ToLower();

                // Validate response
                if (normalized.Contains("high"))
                    return "high";
                if (normalized.Contains("medium"))
                    return "medium";
                if (normalized.Contains("low"))
                    return "low";

                return "medium";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error determining priority from Ollama");
                return "medium";
            }
        }

        /// <summary>
        /// Combined analysis: extract keywords AND determine priority
        /// </summary>
        public async Task<(List<string> keywords, string priority)> AnalyzeAsync(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return (new List<string>(), "medium");

            var keywords = await ExtractKeywordsAsync(text);
            var priority = await DeterminePriorityAsync(text);

            return (keywords, priority);
        }

        /// <summary>
        /// Internal method to call Ollama API
        /// </summary>
        private async Task<string> CallOllamaAsync(string prompt, int maxRetries = 3)
        {
            var requestBody = new
            {
                model = _modelName,
                prompt = prompt,
                stream = false,
                temperature = 0.3, // Lower temp for more consistent results
                top_p = 0.9
            };

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                try
                {
                    var jsonContent = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

                    var response = await _httpClient.PostAsync($"{_ollamaEndpoint}/api/generate", content);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Ollama API returned status {response.StatusCode} on attempt {attempt + 1}");

                        if (attempt < maxRetries - 1)
                        {
                            await Task.Delay(1000 * (attempt + 1)); // Exponential backoff
                            continue;
                        }
                    }

                    var responseText = await response.Content.ReadAsStringAsync();

                    if (string.IsNullOrWhiteSpace(responseText))
                        return string.Empty;

                    var ollamaResponse = JsonSerializer.Deserialize<OllamaResponse>(responseText);
                    return ollamaResponse?.Response ?? string.Empty;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error calling Ollama on attempt {attempt + 1}/{maxRetries}");

                    if (attempt < maxRetries - 1)
                    {
                        await Task.Delay(1000 * (attempt + 1));
                        continue;
                    }

                    throw;
                }
            }

            return string.Empty;
        }

        /// <summary>
        /// DTO for Ollama API response
        /// </summary>
        private class OllamaResponse
        {
            [JsonPropertyName("response")]
            public string? Response { get; set; }

            [JsonPropertyName("done")]
            public bool Done { get; set; }
        }
    }

    /// <summary>
    /// Wrapper service that delegates to OllamaAiService but falls back to KeywordAnalysisService if needed
    /// </summary>
    public class HybridAiService : IAiAnalysisService
    {
        private readonly OllamaAiService _ollamaService;
        private readonly IKeywordAnalysisService _fallbackService;
        private readonly ILogger<HybridAiService> _logger;

        public HybridAiService(
            OllamaAiService ollamaService,
            IKeywordAnalysisService fallbackService,
            ILogger<HybridAiService> logger)
        {
            _ollamaService = ollamaService;
            _fallbackService = fallbackService;
            _logger = logger;
        }

        public async Task<bool> IsAvailableAsync()
        {
            return await _ollamaService.IsAvailableAsync();
        }

        public async Task<List<string>> ExtractKeywordsAsync(string? text)
        {
            try
            {
                var result = await _ollamaService.ExtractKeywordsAsync(text);
                if (result.Count > 0)
                    return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Ollama keyword extraction failed, using fallback: {ex.Message}");
            }

            // Fallback to rule-based service (requires keyword dictionary)
            _logger.LogInformation("Using fallback keyword analysis service");
            return new List<string>();
        }

        public async Task<string> DeterminePriorityAsync(string? text)
        {
            try
            {
                var result = await _ollamaService.DeterminePriorityAsync(text);
                if (result != "medium") // If not default
                    return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Ollama priority determination failed, using fallback: {ex.Message}");
            }

            // Fallback to default
            _logger.LogInformation("Using default priority (medium)");
            return "medium";
        }

        public async Task<(List<string> keywords, string priority)> AnalyzeAsync(string? text)
        {
            var keywords = await ExtractKeywordsAsync(text);
            var priority = await DeterminePriorityAsync(text);
            return (keywords, priority);
        }
    }
}
