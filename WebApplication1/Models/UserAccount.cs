using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class UserAccount
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int Type { get; set; }

    // Forum moderation
    public bool IsBanned { get; set; }            // permanent ban when true and BannedUntil is null
    public DateTime? BannedUntil { get; set; }    // timeout expiry; null = no time limit
    public string? BanReason { get; set; }
}
