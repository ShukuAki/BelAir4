namespace WebApplication1.Models;

public class Contact
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Role { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
