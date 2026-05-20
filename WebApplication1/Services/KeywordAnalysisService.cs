using WebApplication1.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace WebApplication1.Services
{
    public interface IKeywordAnalysisService
    {
        string DeterminePriority(string? description, List<KeywordDictionary> keywords);
        List<string> ExtractMatchedKeywords(string? description, List<KeywordDictionary> keywords);
        double CalculatePriorityScore(string priority);
    }

    public class KeywordAnalysisService : IKeywordAnalysisService
    {
        /// <summary>
        /// Analyzes description text and returns priority level (high, medium, low)
        /// based on keyword matches in the description.
        /// </summary>
        public string DeterminePriority(string? description, List<KeywordDictionary> keywords)
        {
            if (string.IsNullOrWhiteSpace(description) || keywords == null || keywords.Count == 0)
                return "medium"; // default priority

            var matched = ExtractMatchedKeywords(description, keywords);
            if (matched.Count == 0)
                return "medium";

            // Determine highest severity from matched keywords
            var severities = matched
                .SelectMany(kw => keywords.Where(k => k.Keyword != null && k.Keyword.Equals(kw, StringComparison.OrdinalIgnoreCase)))
                .Select(k => k.Severity)
                .Distinct()
                .ToList();

            // Priority order: high > medium > low
            if (severities.Contains("high"))
                return "high";
            if (severities.Contains("medium"))
                return "medium";
            return "low";
        }

        /// <summary>
        /// Extracts keywords from description that match the keyword dictionary.
        /// Uses case-insensitive substring matching.
        /// </summary>
        public List<string> ExtractMatchedKeywords(string? description, List<KeywordDictionary> keywords)
        {
            if (string.IsNullOrWhiteSpace(description))
                return new List<string>();

            var matched = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var descLower = description.ToLowerInvariant();

            foreach (var keyword in keywords.Where(k => k.IsActive))
            {
                if (!string.IsNullOrWhiteSpace(keyword.Keyword))
                {
                    // Word boundary matching to avoid partial matches
                    var pattern = $@"\b{Regex.Escape(keyword.Keyword)}\b";
                    if (Regex.IsMatch(descLower, pattern, RegexOptions.IgnoreCase))
                    {
                        matched.Add(keyword.Keyword ?? string.Empty);
                    }
                }
            }

            return matched.ToList();
        }

        /// <summary>
        /// Converts priority string to numeric score for sorting/comparison.
        /// high=3, medium=2, low=1
        /// </summary>
        public double CalculatePriorityScore(string priority)
        {
            return priority?.ToLowerInvariant() switch
            {
                "high" => 3.0,
                "medium" => 2.0,
                "low" => 1.0,
                _ => 2.0 // default to medium
            };
        }
    }
}
