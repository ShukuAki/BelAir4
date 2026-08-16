namespace WebApplication1.Models;

public class BodMember
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Position { get; set; }
    public string? Term { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
