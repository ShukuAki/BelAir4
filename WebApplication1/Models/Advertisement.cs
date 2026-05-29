using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Advertisement
    {
        public int Id { get; set; }
        public string? Type { get; set; } // Business Ad, Selling, Services, Looking For
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Author { get; set; } // poster name
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactLink { get; set; }
        public string? Price { get; set; } // optional, for Selling
        public string? Availability { get; set; } // optional, for Services/Business Ad
        public string? Image { get; set; } // image URL
        public string? Status { get; set; } = "pending"; // pending, approved, rejected
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; } // when staff approved/rejected
        public string? ReviewedBy { get; set; } // staff username who reviewed
    }
}
