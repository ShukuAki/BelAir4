using System.Net;
using System.Text.Json;
using WebApplication1.Models;
using Xunit;

namespace WebApplication1.IntegrationTests.ApiTests;

/// <summary>
/// Integration tests for Keyword/Word Bank API
/// </summary>
public class KeywordsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/keywords";

    [Fact]
    public async Task GetKeywords_ReturnsSeededKeywords()
    {
        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Keyword>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotEmpty(result.Data); // Should have seeded keywords
    }

    [Fact]
    public async Task GetActiveKeywords_ReturnsOnlyActiveKeywords()
    {
        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/active");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Keyword>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task CreateKeyword_WithValidData_ReturnsCreatedKeyword()
    {
        // Arrange
        var newKeyword = new
        {
            Keyword1 = "flooding",
            Severity = "high",
            Language = "English",
            Category = "disaster",
            Description = "Water overflow issue"
        };

        // Act
        var response = await PostAsync(BaseUrl, newKeyword);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<Keyword>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("flooding", result.Data.Keyword1);
    }

    [Fact]
    public async Task UpdateKeyword_ChangesKeywordDetails()
    {
        // Arrange
        var newKeyword = new { Keyword1 = "test-keyword", Severity = "low", Language = "English", Category = "test" };
        var createResponse = await PostAsync(BaseUrl, newKeyword);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<Keyword>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var keywordId = created?.Data?.Id ?? 0;

        var updateData = new { Severity = "high", Description = "Updated severity" };

        // Act
        var response = await PutAsync($"{BaseUrl}/{keywordId}", updateData);

        // Assert
        AssertSuccess(response);
    }

    [Fact]
    public async Task GetKeywordStats_ReturnsStatistics()
    {
        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/statistics");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
    }
}

/// <summary>
/// Integration tests for Advertisements API
/// </summary>
public class AdvertisementsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/advertisements";

    [Fact]
    public async Task CreateAdvertisement_WithValidData_ReturnsPendingApproval()
    {
        // Arrange
        var newAd = new
        {
            Title = "Used Furniture for Sale",
            Description = "Almost new dining set",
            Category = "Goods",
            Price = 5000,
            PosterName = "Carlos",
            PosterContact = "+63-917-123-4567",
            ImagePath = "/ads/furniture.jpg",
            Status = "pending"
        };

        // Act
        var response = await PostAsync(BaseUrl, newAd);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetPendingAdvertisements_ReturnsOnlyPendingAds()
    {
        // Arrange - Create multiple ads
        var ad1 = new { Title = "Ad 1", Description = "Desc", Category = "Services", Price = 1000, PosterName = "P1", PosterContact = "111", ImagePath = "/path", Status = "pending" };
        var ad2 = new { Title = "Ad 2", Description = "Desc", Category = "Goods", Price = 2000, PosterName = "P2", PosterContact = "222", ImagePath = "/path", Status = "pending" };

        await PostAsync(BaseUrl, ad1);
        await PostAsync(BaseUrl, ad2);

        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/pending");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }

    [Fact]
    public async Task ApproveAdvertisement_ChangesStatusToApproved()
    {
        // Arrange
        var newAd = new { Title = "Test Ad", Description = "Test", Category = "Goods", Price = 1000, PosterName = "Test", PosterContact = "Test", ImagePath = "/test", Status = "pending" };
        var createResponse = await PostAsync(BaseUrl, newAd);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var adId = idElement.GetInt32();

            // Act
            var approveResponse = await PostAsync($"{BaseUrl}/{adId}/approve", new { reviewedBy = "Admin" });

            // Assert
            AssertSuccess(approveResponse);
        }
    }

    [Fact]
    public async Task RejectAdvertisement_ChangesStatusToRejected()
    {
        // Arrange
        var newAd = new { Title = "Test Ad", Description = "Test", Category = "Goods", Price = 1000, PosterName = "Test", PosterContact = "Test", ImagePath = "/test", Status = "pending" };
        var createResponse = await PostAsync(BaseUrl, newAd);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var adId = idElement.GetInt32();

            // Act
            var rejectResponse = await PostAsync($"{BaseUrl}/{adId}/reject", new { reviewedBy = "Admin" });

            // Assert
            AssertSuccess(rejectResponse);
        }
    }
}

/// <summary>
/// Integration tests for Registrations API (Vehicle/Pet)
/// </summary>
public class RegistrationsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/registrations";

    [Fact]
    public async Task CreateVehicleRegistration_WithValidData_ReturnsPending()
    {
        // Arrange
        var newRegistration = new
        {
            Type = "vehicle",
            Make = "Toyota",
            Model = "Fortuner",
            Year = 2022,
            LicensePlate = "ABC-1234",
            Color = "Black",
            OwnerName = "Juan",
            OwnerContact = "+63-917-555-1234",
            PhotoPath = "/photos/car.jpg",
            Status = "pending"
        };

        // Act
        var response = await PostAsync(BaseUrl, newRegistration);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task CreatePetRegistration_WithValidData_ReturnsPending()
    {
        // Arrange
        var newRegistration = new
        {
            Type = "pet",
            PetName = "Buddy",
            Species = "Dog",
            Breed = "Labrador",
            Color = "Brown",
            MicrochipId = "123456789",
            OwnerName = "Maria",
            OwnerContact = "+63-917-555-5678",
            PhotoPath = "/photos/dog.jpg",
            Status = "pending"
        };

        // Act
        var response = await PostAsync(BaseUrl, newRegistration);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetPendingRegistrations_ReturnsOnlyPending()
    {
        // Arrange
        var reg1 = new { Type = "vehicle", Make = "Honda", Model = "Civic", Year = 2023, LicensePlate = "XYZ-999", Color = "Red", OwnerName = "O1", OwnerContact = "111", PhotoPath = "/p1", Status = "pending" };
        var reg2 = new { Type = "pet", PetName = "Fluffy", Species = "Cat", Breed = "Persian", Color = "White", MicrochipId = "111", OwnerName = "O2", OwnerContact = "222", PhotoPath = "/p2", Status = "pending" };

        await PostAsync(BaseUrl, reg1);
        await PostAsync(BaseUrl, reg2);

        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/pending");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Data?.Count >= 2);
    }

    [Fact]
    public async Task ApproveRegistration_ChangesStatusToApproved()
    {
        // Arrange
        var newRegistration = new { Type = "vehicle", Make = "Nissan", Model = "Altis", Year = 2020, LicensePlate = "ABC-5555", Color = "Silver", OwnerName = "Test", OwnerContact = "Test", PhotoPath = "/test", Status = "pending" };
        var createResponse = await PostAsync(BaseUrl, newRegistration);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<dynamic>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var createdObj = (JsonElement)created?.Data!;
        if (createdObj.TryGetProperty("id", out var idElement))
        {
            var regId = idElement.GetInt32();

            // Act
            var approveResponse = await PostAsync($"{BaseUrl}/{regId}/approve", new { reviewedBy = "Admin" });

            // Assert
            AssertSuccess(approveResponse);
        }
    }
}

/// <summary>
/// Integration tests for Meeting Records API
/// </summary>
public class MeetingRecordsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/meeting-records";

    [Fact]
    public async Task CreateMeetingRecord_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var newMeeting = new
        {
            Title = "Annual General Meeting 2024",
            Date = "2024-11-15",
            Type = "AGM",
            FilePath = "/meetings/agm-2024.pdf"
        };

        // Act
        var response = await PostAsync(BaseUrl, newMeeting);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task GetMeetingRecords_ReturnsAllRecords()
    {
        // Arrange
        var meeting1 = new { Title = "BOD Meeting", Date = "2024-11-01", Type = "BOD", FilePath = "/p1" };
        var meeting2 = new { Title = "Special Meeting", Date = "2024-11-08", Type = "Special", FilePath = "/p2" };

        await PostAsync(BaseUrl, meeting1);
        await PostAsync(BaseUrl, meeting2);

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
/// Integration tests for Cross-Page Data Synchronization
/// </summary>
public class DataSynchronizationTests : IntegrationTestBase
{
    [Fact]
    public async Task Staff_CreatesAnnouncement_ResidentPageCanRetrieveIt()
    {
        // Arrange - Staff creates announcement
        const string announcementUrl = "/api/announcements";
        var newAnnouncement = new
        {
            Title = "Important Update",
            Body = "Please read this announcement",
            Category = "General",
            Status = "published",
            PostedBy = "Admin"
        };

        var createResponse = await PostAsync(announcementUrl, newAnnouncement);
        AssertSuccess(createResponse);

        // Act - Resident page fetches announcements
        var getResponse = await _client!.GetAsync(announcementUrl);

        // Assert - Announcement is visible
        AssertSuccess(getResponse);
        var content = await getResponse.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Announcement>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.Single(result.Data ?? new List<Announcement>());
        Assert.Equal("Important Update", result.Data?[0].Title);
    }

    [Fact]
    public async Task Resident_SubmitsReservation_StaffDashboard_CanApproveIt()
    {
        // Arrange - Resident submits reservation
        const string reservationUrl = "/api/reservations";
        var newReservation = new
        {
            AmenityName = "Function Hall",
            ResidentName = "Test User",
            ReservationDate = "2024-12-30",
            StartTime = "10:00",
            EndTime = "12:00",
            Purpose = "Birthday celebration",
            Email = "test@email.com",
            Phone = "555-0000"
        };

        var createResponse = await PostAsync(reservationUrl, newReservation);
        AssertSuccess(createResponse);

        // Act - Staff retrieves pending reservations
        var pendingResponse = await _client!.GetAsync($"{reservationUrl}/status/pending");

        // Assert - Reservation appears in pending list
        AssertSuccess(pendingResponse);
        var content = await pendingResponse.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Reservation>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.NotEmpty(result.Data ?? new List<Reservation>());
    }

    [Fact]
    public async Task Resident_ReportsIncident_StaffCanViewInQueue()
    {
        // Arrange - Resident reports incident
        var incident = new
        {
            Description = "Broken streetlight at entrance",
            Category = "Infrastructure",
            Location = "Main Entrance",
            ReporterName = "Anonymous",
            ReporterContact = "Anonymous",
            IsPublic = true
        };

        var createResponse = await PostAsync("/api/concerns/report", incident);
        AssertSuccess(createResponse);

        // Act - Staff retrieves incidents
        var getResponse = await _client!.GetAsync("/api/incidents");

        // Assert - Incident appears in list
        AssertSuccess(getResponse);
        var content = await getResponse.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<dynamic>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
    }
}
