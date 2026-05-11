namespace WebApplication1.Models
{
    public class Reply
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string? Name { get; set; }
        public bool IsStaff { get; set; }
        public string? Date { get; set; }
        public string? Text { get; set; }

        // Prevent JSON serialization cycles when returning Post objects with their Replies.
        // The server-side API returns Post objects that include Replies; the Reply.Post
        // navigation back-reference would create a cycle during JSON serialization and
        // cause the API to fail. Marking this property to be ignored by the JSON
        // serializer and making it nullable avoids that issue.
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual Post? Post { get; set; }
    }
}