using System;
using System.Text.Json.Serialization;

namespace WebApplication1.Models
{
    public class Reservation
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("userId")]
        public string? UserId { get; set; }
        [JsonPropertyName("residentName")]
        public string? ResidentName { get; set; }
        [JsonPropertyName("amenity")]
        public string Amenity { get; set; } = null!;
        [JsonPropertyName("date")]
        public string Date { get; set; } = null!;       // stored as "yyyy-MM-dd"
        [JsonPropertyName("startTime")]
        public string StartTime { get; set; } = null!;   // stored as "HH:mm"
        [JsonPropertyName("endTime")]
        public string EndTime { get; set; } = null!;     // stored as "HH:mm"
        [JsonPropertyName("purpose")]
        public string? Purpose { get; set; }
        [JsonPropertyName("notes")]
        public string? Notes { get; set; }
        [JsonPropertyName("status")]
        public string Status { get; set; } = "pending";  // pending, approved, rejected
        [JsonPropertyName("submittedAt")]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        [JsonPropertyName("reviewedAt")]
        public DateTime? ReviewedAt { get; set; }
        [JsonPropertyName("reviewedBy")]
        public string? ReviewedBy { get; set; }
        [JsonPropertyName("rejectionReason")]
        public string? RejectionReason { get; set; }
    }
}
