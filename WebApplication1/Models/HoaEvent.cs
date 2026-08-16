namespace WebApplication1.Models;

public class HoaEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Date { get; set; } = "";
    public string? Time { get; set; }
    public string? Location { get; set; }
    public string? Category { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
