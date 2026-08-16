using System;

namespace WebApplication1.Models
{
    /// <summary>
    /// Represents a landmark or point of interest in Laguna BelAir 4
    /// Used for displaying on the community map
    /// </summary>
    public class Landmark
    {
        public int Id { get; set; }

        /// <summary>
        /// Name of the landmark (e.g., "HOA Office", "Basketball Court")
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the landmark
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Category (e.g., "Building", "Court", "Gate", "Facility")
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Font Awesome icon class (e.g., "fa-building", "fa-basketball-ball")
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Latitude coordinate
        /// </summary>
        public decimal Latitude { get; set; }

        /// <summary>
        /// Longitude coordinate
        /// </summary>
        public decimal Longitude { get; set; }

        /// <summary>
        /// Additional location notes
        /// </summary>
        public string LocationNotes { get; set; }

        /// <summary>
        /// Whether this landmark is active/visible on the map
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// When the landmark was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the landmark was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
