namespace WebApplication1.Models;

public class HoaDocument
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Category { get; set; }
    public string? FilePath { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
