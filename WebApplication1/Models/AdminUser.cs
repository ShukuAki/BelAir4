using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public class AdminUser
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public int RoleId { get; set; }

    public AdminRole? Role { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    public string? IPAddress { get; set; }

    public string Status { get; set; } = "Active"; // Active, Suspended, Offline, Away

    public bool IsSuspended { get; set; } = false;

    public DateTime? SuspendedUntil { get; set; }

    public string? SuspensionReason { get; set; }

    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public ICollection<StaffInvitation> SentInvitations { get; set; } = new List<StaffInvitation>();
}
