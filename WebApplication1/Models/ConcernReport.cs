using System;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models
{
    public class ConcernReport
    {
        public int Id { get; set; }
        [StringLength(4000)]
        public string? Description { get; set; }
        [StringLength(100)]
        public string? Category { get; set; }
        [StringLength(250)]
        public string? Address { get; set; }
        [StringLength(250)]
        public string? Street { get; set; }
        [StringLength(500)]
        public string? AdditionalLocation { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool Anonymous { get; set; }
        [StringLength(150)]
        public string? ReporterName { get; set; }
        [StringLength(150)]
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
