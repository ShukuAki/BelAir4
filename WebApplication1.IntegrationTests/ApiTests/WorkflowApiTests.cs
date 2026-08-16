using System.Net;
using System.Text.Json;
using WebApplication1.Models;
using Xunit;

namespace WebApplication1.IntegrationTests.ApiTests;

/// <summary>
/// Integration tests for Reservations API (approval workflow)
/// </summary>
public class ReservationsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/reservations";

    [Fact]
    public async Task CreateReservation_WithValidData_ReturnsPending()
    {
        // Arrange
        var newReservation = new
        {
            AmenityName = "Pool",
            ResidentName = "Jane Doe",
            ReservationDate = "2024-12-25",
            StartTime = "14:00",
            EndTime = "16:00",
            Purpose = "Birthday party",
            Email = "jane@test.com",
            Phone = "555-1234"
        };

        // Act
        var response = await PostAsync(BaseUrl, newReservation);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<Reservation>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Pool", result.Data.AmenityName);
        Assert.Equal("pending", result.Data.Status?.ToLower());
    }

    [Fact]
    public async Task GetPendingReservations_ReturnsOnlyPendingItems()
    {
        // Arrange - Create multiple reservations
        var res1 = new { AmenityName = "Pool", ResidentName = "R1", ReservationDate = "2024-12-25", StartTime = "14:00", EndTime = "16:00", Purpose = "Test", Email = "r1@test.com", Phone = "555-1111" };
        var res2 = new { AmenityName = "Hall", ResidentName = "R2", ReservationDate = "2024-12-26", StartTime = "18:00", EndTime = "20:00", Purpose = "Test", Email = "r2@test.com", Phone = "555-2222" };

        await PostAsync(BaseUrl, res1);
        await PostAsync(BaseUrl, res2);

        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/status/pending");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Reservation>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.Count >= 2);
    }

    [Fact]
    public async Task ApproveReservation_WithValidId_ChangesStatusToApproved()
    {
        // Arrange
        var newReservation = new { AmenityName = "Pool", ResidentName = "Test", ReservationDate = "2024-12-25", StartTime = "14:00", EndTime = "16:00", Purpose = "Test", Email = "test@test.com", Phone = "555-9999" };
        var createResponse = await PostAsync(BaseUrl, newReservation);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<Reservation>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var reservationId = created?.Data?.Id ?? 0;

        // Act
        var approveResponse = await PostAsync($"{BaseUrl}/{reservationId}/approve", new { });

        // Assert
        AssertSuccess(approveResponse);
    }

    [Fact]
    public async Task RejectReservation_WithReason_ChangeStatusToRejected()
    {
        // Arrange
        var newReservation = new { AmenityName = "Pool", ResidentName = "Test", ReservationDate = "2024-12-25", StartTime = "14:00", EndTime = "16:00", Purpose = "Test", Email = "test@test.com", Phone = "555-9999" };
        var createResponse = await PostAsync(BaseUrl, newReservation);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<Reservation>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var reservationId = created?.Data?.Id ?? 0;

        // Act
        var rejectResponse = await PostAsync($"{BaseUrl}/{reservationId}/reject", new { reason = "Already booked" });

        // Assert
        AssertSuccess(rejectResponse);
    }
}

/// <summary>
/// Integration tests for Incidents/Concerns API
/// </summary>
public class IncidentsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/incidents";

    [Fact]
    public async Task ReportIncident_WithValidData_ReturnsPriorityDetected()
    {
        // Arrange
        var newIncident = new
        {
            Description = "There is damage to the fence",
            Category = "Property Damage",
            Location = "Main Gate",
            ReporterName = "John",
            ReporterContact = "555-1234",
            IsPublic = true
        };

        // Act
        var response = await PostAsync("/api/concerns/report", newIncident);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetIncidents_ReturnsAllReportedIncidents()
    {
        // Arrange - Create multiple incidents
        var incident1 = new { Description = "Damage to fence", Category = "Property", Location = "Gate", ReporterName = "R1", ReporterContact = "111", IsPublic = true };
        var incident2 = new { Description = "Noise complaint", Category = "Noise", Location = "Block A", ReporterName = "R2", ReporterContact = "222", IsPublic = true };

        await PostAsync("/api/concerns/report", incident1);
        await PostAsync("/api/concerns/report", incident2);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }

    [Fact]
    public async Task ResolveIncident_WithValidId_ChangeStatusToResolved()
    {
        // Arrange
        var incident = new { Description = "Test issue", Category = "Test", Location = "Test", ReporterName = "Test", ReporterContact = "Test", IsPublic = false };
        var createResponse = await PostAsync("/api/concerns/report", incident);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Extract ID from response
        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var incidentId = idElement.GetInt32();

            // Act
            var resolveResponse = await PostAsync($"{BaseUrl}/{incidentId}/resolve", new { comment = "Fixed" });

            // Assert
            AssertSuccess(resolveResponse);
        }
    }

    [Fact]
    public async Task CommentOnIncident_AddsCommentSuccessfully()
    {
        // Arrange
        var incident = new { Description = "Test issue", Category = "Test", Location = "Test", ReporterName = "Test", ReporterContact = "Test", IsPublic = false };
        var createResponse = await PostAsync("/api/concerns/report", incident);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var incidentId = idElement.GetInt32();

            // Act
            var commentResponse = await PostAsync($"{BaseUrl}/{incidentId}/comment", 
                new { comment = "Working on it", status = "in-progress" });

            // Assert
            AssertSuccess(commentResponse);
        }
    }
}

/// <summary>
/// Integration tests for Forums/Posts API
/// </summary>
public class ForumsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/forums/posts";

    [Fact]
    public async Task CreatePost_WithValidData_ReturnsCreatedPost()
    {
        // Arrange
        var newPost = new
        {
            Title = "Where to buy groceries nearby?",
            Description = "Looking for good supermarkets in the area",
            Category = "Recommendations",
            AuthorName = "Maria"
        };

        // Act
        var response = await PostAsync(BaseUrl, newPost);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetPosts_ReturnsAllPosts()
    {
        // Arrange
        var post1 = new { Title = "Post 1", Description = "Desc 1", Category = "General", AuthorName = "A1" };
        var post2 = new { Title = "Post 2", Description = "Desc 2", Category = "General", AuthorName = "A2" };

        await PostAsync(BaseUrl, post1);
        await PostAsync(BaseUrl, post2);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }

    [Fact]
    public async Task ReplyToPost_WithValidId_ReturnsCreatedReply()
    {
        // Arrange
        var newPost = new { Title = "Question Post", Description = "Need help", Category = "Help", AuthorName = "Helper" };
        var createResponse = await PostAsync(BaseUrl, newPost);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var postId = idElement.GetInt32();

            var reply = new { Content = "Great suggestion!", AuthorName = "Replier" };

            // Act
            var replyResponse = await PostAsync($"{BaseUrl}/{postId}/reply", reply);

            // Assert
            AssertSuccess(replyResponse);
        }
    }
}

/// <summary>
/// Integration tests for BOD Members API
/// </summary>
public class BodMembersApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/bod-members";

    [Fact]
    public async Task CreateBodMember_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var newMember = new
        {
            Name = "Maria Santos",
            Position = "President",
            Term = "2024-2026",
            Phone = "+63-917-555-1234",
            Email = "maria@belair4.com"
        };

        // Act
        var response = await PostAsync(BaseUrl, newMember);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetBodMembers_ReturnsAllMembers()
    {
        // Arrange
        var member1 = new { Name = "Member 1", Position = "Vice", Term = "2024-2026", Phone = "111", Email = "m1@test.com" };
        var member2 = new { Name = "Member 2", Position = "Treasurer", Term = "2024-2026", Phone = "222", Email = "m2@test.com" };

        await PostAsync(BaseUrl, member1);
        await PostAsync(BaseUrl, member2);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }
}

/// <summary>
/// Integration tests for Documents API
/// </summary>
public class DocumentsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/hoa-documents";

    [Fact]
    public async Task CreateDocument_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var newDocument = new
        {
            Name = "HOA Rules and Regulations",
            Category = "Rules",
            FilePath = "/documents/rules-2024.pdf"
        };

        // Act
        var response = await PostAsync(BaseUrl, newDocument);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetDocuments_ReturnsAllDocuments()
    {
        // Arrange
        var doc1 = new { Name = "Doc 1", Category = "Rules", FilePath = "/path1" };
        var doc2 = new { Name = "Doc 2", Category = "Forms", FilePath = "/path2" };

        await PostAsync(BaseUrl, doc1);
        await PostAsync(BaseUrl, doc2);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }
}
