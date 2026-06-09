using System;

namespace WebApplication1.Models
{
    public class ConcernReport
    {
        public int Id { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string? Address { get; set; }
        public string? Street { get; set; }
        public string? AdditionalLocation { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool Anonymous { get; set; }
        public string? ReporterName { get; set; }
        public string? ReporterContact { get; set; }
        public string? Photo { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Reference { get; set; }
        // AI Priority Detection
        public string? Priority { get; set; } = "medium"; // "high", "medium", "low"
        public string? DetectedKeywords { get; set; } // comma-separated keywords found in description
        public bool IsPublic { get; set; } = true; // visible on community map or staff-only
        // Resolution / staff handling
        public string? Status { get; set; } = "open"; // "open", "in-progress", "resolved"
        public string? StaffComment { get; set; } // staff note / resolution comment
        public string? ResolvedBy { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
