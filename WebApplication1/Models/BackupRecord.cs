using System;

namespace WebApplication1.Models;

public class BackupRecord
{
    public int Id { get; set; }

    public string BackupId { get; set; } = null!; // e.g., BKP-0234

    public string BackupType { get; set; } = "Auto"; // Auto, Manual

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string FilePath { get; set; } = null!;

    public long FileSizeBytes { get; set; } // Size in bytes

    public string Status { get; set; } = "Success"; // Success, Failed, Running

    public int? CreatedByAdminUserId { get; set; } // For manual backups

    public AdminUser? CreatedByAdminUser { get; set; }

    public string? ErrorMessage { get; set; } // If backup failed

    public DateTime? CompletedAt { get; set; }

    public DateTime? RestoredAt { get; set; }

    public int? RestoredByAdminUserId { get; set; } // If restored

    public string? RestoreNotes { get; set; }

    public string? Checksum { get; set; } // For integrity verification
}
