using System;

namespace WebApplication1.Models;

public class AdminSetting
{
    public int Id { get; set; }

    public string SettingKey { get; set; } = null!; // e.g., "village.name", "ad.fee", "dues.rate"

    public string SettingValue { get; set; } = null!; // Value as string

    public string SettingType { get; set; } = "String"; // String, Int, Bool, Decimal

    public string Category { get; set; } = "General"; // General, Features, Security, Integration

    public string Description { get; set; } = null!;

    public bool IsEditable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    public int? DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedByAdminUserId { get; set; }
}
