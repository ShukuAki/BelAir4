using System;

namespace WebApplication1.Models;

public class NotificationSubscriber
{
    public int Id { get; set; }

    public string? ResidentName { get; set; }

    public string Email { get; set; } = null!;

    public string? DeviceInfo { get; set; } // browser/device identifier, optional

    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public DateTime? UnsubscribedAt { get; set; }

    public DateTime? LastNotifiedAt { get; set; }

    public int NotificationsSentCount { get; set; } = 0;
}
