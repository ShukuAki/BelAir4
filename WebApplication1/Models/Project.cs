using System;

namespace WebApplication1.Models
{
    /// <summary>
    /// Represents a community project or maintenance work
    /// Used for displaying on the community map
    /// </summary>
    public class Project
    {
        public int Id { get; set; }

        /// <summary>
        /// Project name/title (e.g., "Road Maintenance", "Park Renovation")
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Detailed description of the project
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Project status: "planned", "ongoing", "completed", "paused"
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Category of project (e.g., "Infrastructure", "Maintenance", "Community", "Safety")
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Location/address of the project
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// Latitude coordinate (center of project area)
        /// </summary>
        public decimal? Latitude { get; set; }

        /// <summary>
        /// Longitude coordinate (center of project area)
        /// </summary>
        public decimal? Longitude { get; set; }

        /// <summary>
        /// Estimated start date
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Estimated completion date
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Project budget (if applicable)
        /// </summary>
        public decimal? Budget { get; set; }

        /// <summary>
        /// Contact person for the project
        /// </summary>
        public string ContactPerson { get; set; }

        /// <summary>
        /// Contact phone for the project
        /// </summary>
        public string ContactPhone { get; set; }

        /// <summary>
        /// Before project photo URL
        /// </summary>
        public string BeforePhotoUrl { get; set; }

        /// <summary>
        /// After project photo URL
        /// </summary>
        public string AfterPhotoUrl { get; set; }

        /// <summary>
        /// Estimated progress percentage (0-100)
        /// </summary>
        public int ProgressPercentage { get; set; } = 0;

        /// <summary>
        /// When the project was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the project was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
