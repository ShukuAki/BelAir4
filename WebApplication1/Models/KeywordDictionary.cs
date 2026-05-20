using System;

namespace WebApplication1.Models
{
    public class KeywordDictionary
    {
        public int Id { get; set; }
        public string? Keyword { get; set; }
        public string? Severity { get; set; } // "high", "medium", "low"
        public string? Category { get; set; } // "Safety", "Infrastructure", "Maintenance", "Roads", "Sanitation", etc.
        public string? Language { get; set; } // "en" (English), "tl" (Tagalog), or "bilingual"
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
