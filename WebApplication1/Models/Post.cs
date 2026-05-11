using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Category { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public string? Author { get; set; }
        public string? Date { get; set; }
        public int Helpful { get; set; }
        public string? Image { get; set; }
        public string? Location { get; set; }

        public virtual ICollection<Reply> Replies { get; set; } = new List<Reply>();
    }
}