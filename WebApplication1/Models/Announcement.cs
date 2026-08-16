namespace WebApplication1.Models;

public class Announcement
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Body { get; set; }
    public string? Category { get; set; }
    public string? PostedBy { get; set; }
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "published";
    public DateTime? ScheduledAt { get; set; }
}
