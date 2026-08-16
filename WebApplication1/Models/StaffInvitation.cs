using System;

namespace WebApplication1.Models;

public class StaffInvitation
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string EmailAddress { get; set; } = null!;

    public int RoleId { get; set; }

    public AdminRole? Role { get; set; }

    public int InvitedByAdminUserId { get; set; }

    public AdminUser? InvitedByAdminUser { get; set; }

    public string InvitationToken { get; set; } = null!; // Unique token for invite link

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7); // 7 days default

    public DateTime? AcceptedAt { get; set; }

    public DateTime? RejectedAt { get; set; }

    public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected, Expired

    public string? PersonalMessage { get; set; }

    public int ResendCount { get; set; } = 0;

    public DateTime? LastResendAt { get; set; }
}
