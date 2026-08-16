using System;

namespace WebApplication1.Models;

public class BanRecord
{
    public int Id { get; set; }

    public string AccountName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public int? ResidentId { get; set; } // FK to UserAccount/Resident if applicable

    public string BanReason { get; set; } = null!;

    public int BannedByAdminUserId { get; set; }

    public AdminUser? BannedByAdminUser { get; set; }

    public DateTime BannedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UnbannedAt { get; set; }

    public string Duration { get; set; } = "Permanent"; // Permanent, 7 days, 30 days, etc.

    public DateTime? ExpiresAt { get; set; } // Null = permanent ban

    public string Status { get; set; } = "Active"; // Active, Expired, Lifted

    public string? UnbanReason { get; set; }

    public int? UnbannedByAdminUserId { get; set; }

    public AdminUser? UnbannedByAdminUser { get; set; }
}
