using System;

namespace WebApplication1.Models;

public class Task
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string Category { get; set; } = "General"; // Admin, Maintenance, Finance, Communications, etc.

    public string Priority { get; set; } = "medium"; // high, medium, low

    public string Status { get; set; } = "todo"; // todo, progress, review, done

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? AssignedTo { get; set; } // Staff member name

    public int? AutoDeleteAfterDays { get; set; } // Auto-delete from Done after X days

    public string? Notes { get; set; }
}
