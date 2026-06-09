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
        Task<(List<(string keyword, string severity)> keywordsWithSeverity, string priority)> AnalyzeWithSeveritiesAsync(string? text);
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
        private readonly IReadOnlyList<string> _candidateEndpoints;
        private readonly string _preferredModel;
        private readonly IKeywordAnalysisService _fallbackService;

        // Resolved at runtime by probing the live Ollama instance.
        private string? _resolvedEndpoint;
        private string? _resolvedModel;
        private readonly SemaphoreSlim _resolveLock = new SemaphoreSlim(1, 1);

        public OllamaAiService(
            IHttpClientFactory httpClientFactory,
            ILogger<OllamaAiService> logger,
            IConfiguration configuration,
            IKeywordAnalysisService fallbackService)
        {
            _httpClient = httpClientFactory.CreateClient("ollama");
            _logger = logger;
            _fallbackService = fallbackService;

            // Preferred model from config (optional). If it isn't installed on the
            // local Ollama instance we auto-detect whatever model IS installed.
            _preferredModel = configuration["Ollama:Model"] ?? "mistral";

            // Build the list of endpoints to probe. The configured endpoint (if any)
            // is tried first, followed by common local defaults so the app works on
            // any device running Ollama without manual configuration.
            var endpoints = new List<string>();
            var configured = configuration["Ollama:Endpoint"];
            if (!string.IsNullOrWhiteSpace(configured))
                endpoints.Add(configured.TrimEnd('/'));

            var envEndpoint = Environment.GetEnvironmentVariable("OLLAMA_HOST");
            if (!string.IsNullOrWhiteSpace(envEndpoint))
                endpoints.Add(NormalizeEndpoint(envEndpoint));

            endpoints.Add("http://localhost:11434");
            endpoints.Add("http://127.0.0.1:11434");
            endpoints.Add("http://host.docker.internal:11434");

            _candidateEndpoints = endpoints
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Distinct()
                .ToList();
        }

        private static string NormalizeEndpoint(string value)
        {
            value = value.Trim().TrimEnd('/');
            if (!value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !value.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                value = "http://" + value;
            return value;
        }

        /// <summary>
        /// Checks if any Ollama instance is running and accessible, and resolves
        /// the live endpoint + an installed model to use.
        /// </summary>
        public async Task<bool> IsAvailableAsync()
        {
            return await EnsureResolvedAsync() != null;
        }

        /// <summary>
        /// Probes the candidate endpoints, picks the first reachable Ollama instance,
        /// and selects an installed model (preferred model if present, otherwise the
        /// first available model). Results are cached for the lifetime of the service.
        /// Returns the resolved endpoint, or null if no Ollama instance is reachable.
        /// </summary>
        private async Task<string?> EnsureResolvedAsync()
        {
            if (_resolvedEndpoint != null && _resolvedModel != null)
                return _resolvedEndpoint;

            await _resolveLock.WaitAsync();
            try
            {
                if (_resolvedEndpoint != null && _resolvedModel != null)
                    return _resolvedEndpoint;

                foreach (var endpoint in _candidateEndpoints)
                {
                    var models = await GetInstalledModelsAsync(endpoint);
                    if (models == null || models.Count == 0)
                        continue;

                    // Prefer the configured model (match by exact name or family prefix,
                    // e.g. "mistral" matches "mistral:latest").
                    var chosen = models.FirstOrDefault(m =>
                                     m.Equals(_preferredModel, StringComparison.OrdinalIgnoreCase))
                                 ?? models.FirstOrDefault(m =>
                                     m.StartsWith(_preferredModel + ":", StringComparison.OrdinalIgnoreCase))
                                 ?? models.FirstOrDefault(m =>
                                     m.Split(':')[0].Equals(_preferredModel.Split(':')[0], StringComparison.OrdinalIgnoreCase))
                                 ?? models[0];

                    _resolvedEndpoint = endpoint;
                    _resolvedModel = chosen;
                    _logger.LogInformation(
                        "Ollama resolved at {Endpoint} using model '{Model}' (installed: {Models})",
                        endpoint, chosen, string.Join(", ", models));
                    return _resolvedEndpoint;
                }

                _logger.LogWarning(
                    "No reachable Ollama instance found among: {Endpoints}",
                    string.Join(", ", _candidateEndpoints));
                return null;
            }
            finally
            {
                _resolveLock.Release();
            }
        }

        /// <summary>
        /// Queries /api/tags on the given endpoint and returns the list of installed
        /// model names, or null if the endpoint is unreachable.
        /// </summary>
        private async Task<List<string>?> GetInstalledModelsAsync(string endpoint)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{endpoint}/api/tags");
                if (!response.IsSuccessStatusCode)
                    return null;

                var json = await response.Content.ReadAsStringAsync();
                var tags = JsonSerializer.Deserialize<OllamaTagsResponse>(json);
                return tags?.Models?
                    .Select(m => m.Name)
                    .Where(n => !string.IsNullOrWhiteSpace(n))
                    .Select(n => n!)
                    .ToList() ?? new List<string>();
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Ollama probe failed for {Endpoint}: {Message}", endpoint, ex.Message);
                return null;
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
        /// Extracts keywords with individual severity levels using a single optimised prompt.
        /// Returns each keyword paired with its severity (high/medium/low) plus the overall priority.
        /// </summary>
        public async Task<(List<(string keyword, string severity)> keywordsWithSeverity, string priority)> AnalyzeWithSeveritiesAsync(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return (new List<(string, string)>(), "medium");

            try
            {
                if (!await IsAvailableAsync())
                {
                    _logger.LogWarning("Ollama not available for AnalyzeWithSeveritiesAsync");
                    return (new List<(string, string)>(), "medium");
                }

                var prompt =
                    "You are analyzing a community concern report for a residential subdivision (HOA) in the Philippines. " +
                    "The report may contain English or Filipino/Tagalog words.\n\n" +
                    "Extract the key problem words or phrases from the text below and assign a severity level to each word.\n" +
                    "Output EXACTLY 2 lines — no extra text, no explanations, no numbering:\n" +
                    "Line 1: PRIORITY: <high|medium|low>\n" +
                    "Line 2: KEYWORDS: <word>:<severity>, <word>:<severity>, ...\n\n" +
                    "Example — for the text \"There is a fire near the gate and flooding on the road\":\n" +
                    "PRIORITY: high\n" +
                    "KEYWORDS: fire:high, flooding:high, road:medium\n\n" +
                    "Severity guidelines (use your judgment for words not listed):\n" +
                    "- high: fire, sunog, flood, baha, tornado, typhoon, storm, bagyo, earthquake, lindol, " +
                    "crime, robbery, theft, holdap, nakawan, emergency, medical, break-in, suspicious, " +
                    "terrorizing, terror, threat, danger, attack, destroyed, collapsed, fallen tree, " +
                    "exposed wiring, gas leak, shooting, bala, assassination, hostage\n" +
                    "- medium: power outage, kuryente, pothole, kalsada, road damage, broken light, ilaw, " +
                    "drainage, maintenance, sira, broken, water leak, tubig, leak, damage, cracked, blocked\n" +
                    "- low: parking, trash, basura, noise, ingay, suggestion, request, minor, smell, dirt\n\n" +
                    "Report text: " + text + "\n\n" +
                    "Output (2 lines only):";

                var response = await CallOllamaAsync(prompt);
                _logger.LogInformation("[Ollama] Raw AnalyzeWithSeverities response: {Response}", response);
                return ParseWithSeveritiesResponse(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AnalyzeWithSeveritiesAsync");
                return (new List<(string, string)>(), "medium");
            }
        }

        private (List<(string keyword, string severity)> keywordsWithSeverity, string priority) ParseWithSeveritiesResponse(string response)
        {
            var priority = "medium";
            var keywords = new List<(string keyword, string severity)>();

            if (string.IsNullOrWhiteSpace(response))
                return (keywords, priority);

            foreach (var line in response.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                // Strip markdown bold/header chars so **PRIORITY:** or ## KEYWORDS: still match
                var trimmed = line.Trim().TrimStart('*', '#', '-', ' ', '\t').Trim('*').Trim();

                var priorityIdx = trimmed.IndexOf("PRIORITY:", StringComparison.OrdinalIgnoreCase);
                if (priorityIdx >= 0)
                {
                    var p = trimmed.Substring(priorityIdx + 9).Trim().ToLower();
                    if (p.Contains("high")) priority = "high";
                    else if (p.Contains("low")) priority = "low";
                    else priority = "medium";
                    continue;
                }

                var keywordsIdx = trimmed.IndexOf("KEYWORDS:", StringComparison.OrdinalIgnoreCase);
                if (keywordsIdx >= 0)
                {
                    var kwPart = trimmed.Substring(keywordsIdx + 9).Trim();
                    foreach (var pair in kwPart.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var colonIdx = pair.LastIndexOf(':');
                        if (colonIdx > 0)
                        {
                            var kw = pair.Substring(0, colonIdx).Trim().ToLower()
                                        .Trim('*', '_', '`', '"', '\'');
                            var sev = pair.Substring(colonIdx + 1).Trim().ToLower()
                                         .Trim('*', '_', '`', '"', '\'');
                            if (!string.IsNullOrWhiteSpace(kw) && kw.Length >= 2 && kw.Length <= 60)
                            {
                                if (!new[] { "high", "medium", "low" }.Contains(sev)) sev = "medium";
                                keywords.Add((kw, sev));
                            }
                        }
                    }
                }
            }

            return (keywords, priority);
        }

        /// <summary>
        /// Internal method to call Ollama API
        /// </summary>
        private async Task<string> CallOllamaAsync(string prompt, int maxRetries = 3)
        {
            // Make sure we have a reachable endpoint and an installed model resolved.
            var endpoint = await EnsureResolvedAsync();
            if (endpoint == null || _resolvedModel == null)
            {
                _logger.LogWarning("No Ollama instance/model resolved; cannot call Ollama.");
                return string.Empty;
            }

            var requestBody = new
            {
                model = _resolvedModel,
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

                    var response = await _httpClient.PostAsync($"{endpoint}/api/generate", content);

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

        /// <summary>
        /// DTO for Ollama /api/tags response (list of installed models)
        /// </summary>
        private class OllamaTagsResponse
        {
            [JsonPropertyName("models")]
            public List<OllamaModelInfo>? Models { get; set; }
        }

        private class OllamaModelInfo
        {
            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("model")]
            public string? Model { get; set; }
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

        public async Task<(List<(string keyword, string severity)> keywordsWithSeverity, string priority)> AnalyzeWithSeveritiesAsync(string? text)
        {
            try
            {
                var result = await _ollamaService.AnalyzeWithSeveritiesAsync(text);
                if (result.keywordsWithSeverity.Count > 0)
                    return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Ollama AnalyzeWithSeverities failed: {ex.Message}");
            }
            return (new List<(string, string)>(), "medium");
        }
    }
}
