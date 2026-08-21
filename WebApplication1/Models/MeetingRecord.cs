namespace WebApplication1.Models;

public class MeetingRecord
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Date { get; set; }
    public string? Time { get; set; }
    public string? Location { get; set; }
    public string? Type { get; set; }
    public string? FilePath { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
