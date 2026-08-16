using System;

namespace WebApplication1.Models;

public class AuditLog
{
    public int Id { get; set; }

    public int AdminUserId { get; set; }

    public AdminUser? AdminUser { get; set; }

    public string Action { get; set; } = null!; // e.g., "Updated permissions", "Exported data", "Banned user"

    public string ActionCategory { get; set; } = null!; // e.g., "Auth", "Data Changes", "Approvals", "System"

    public string TargetEntity { get; set; } = null!; // e.g., "Staff Role", "Resident", "Keyword"

    public string TargetEntityId { get; set; } = null!; // ID of the affected entity

    public string? OldValue { get; set; } // JSON serialized previous state (optional)

    public string? NewValue { get; set; } // JSON serialized new state (optional)

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string IPAddress { get; set; } = null!;

    public string? UserAgent { get; set; }

    public string Outcome { get; set; } = "Success"; // Success, Failed, Blocked

    public string? Notes { get; set; }

    // For quick filtering
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public int Month { get; set; } // For monthly reports
    public int Year { get; set; } // For yearly reports
}
