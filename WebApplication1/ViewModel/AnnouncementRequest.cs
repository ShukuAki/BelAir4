namespace WebApplication1.ViewModel;

public class AnnouncementRequest
{
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? Category { get; set; }
    public string? PostedBy { get; set; }
    public string? Status { get; set; }
    public DateTime? ScheduledAt { get; set; }
}
