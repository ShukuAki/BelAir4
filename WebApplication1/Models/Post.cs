using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? Author { get; set; }
        public string? Date { get; set; }
        public int Helpful { get; set; }
        public string? Image { get; set; }
        public string? Location { get; set; }

        // AI Priority Detection
        public string? Priority { get; set; } = "medium"; // "high", "medium", "low"
        public string? DetectedKeywords { get; set; } // comma-separated keywords found in description and title
        public bool IsPublic { get; set; } = true; // visible on community map or staff-only
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
    }
}