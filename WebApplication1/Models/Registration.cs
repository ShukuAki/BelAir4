using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WebApplication1.Models;

public class Registration
{
    public int Id { get; set; }

    [MaxLength(100)]
    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }

    [Required]
    [MaxLength(200)]
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    [JsonPropertyName("mobile")]
    public string Mobile { get; set; } = null!;

    [Required]
    [JsonPropertyName("password")]
    public string Password { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    [JsonPropertyName("residentType")]
    public string ResidentType { get; set; } = null!; // homeowner or tenant

    [Required]
    [MaxLength(500)]
    [JsonPropertyName("address")]
    public string Address { get; set; } = null!;

    [JsonPropertyName("proofOfResidencyPath")]
    public string? ProofOfResidencyPath { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending"; // pending, approved, rejected

    [JsonPropertyName("submittedAt")]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("reviewedAt")]
    public DateTime? ReviewedAt { get; set; }

    [JsonPropertyName("reviewedBy")]
    public string? ReviewedBy { get; set; }

    [JsonPropertyName("rejectionReason")]
    public string? RejectionReason { get; set; }
}
