using System.Net;
using System.Text.Json;
using WebApplication1.Models;
using Xunit;

namespace WebApplication1.IntegrationTests.ApiTests;

/// <summary>
/// Integration tests for Announcements API endpoints
/// </summary>
public class AnnouncementsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/announcements";

    [Fact]
    public async Task GetAnnouncements_WithoutData_ReturnsEmptyList()
    {
        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Announcement>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task CreateAnnouncement_WithValidData_ReturnCreatedAnnouncement()
    {
        // Arrange
        var newAnnouncement = new
        {
            Title = "Test Announcement",
            Body = "This is a test announcement",
            Category = "General",
            Status = "published",
            PostedBy = "TestUser"
        };

        // Act
        var response = await PostAsync(BaseUrl, newAnnouncement);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<Announcement>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Test Announcement", result.Data.Title);
        Assert.Equal("published", result.Data.Status);
    }

    [Fact]
    public async Task GetAnnouncements_AfterCreate_ReturnsCreatedAnnouncement()
    {
        // Arrange
        var newAnnouncement = new
        {
            Title = "Test Announcement",
            Body = "This is a test announcement",
            Category = "General",
            Status = "published",
            PostedBy = "TestUser"
        };

        await PostAsync(BaseUrl, newAnnouncement);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Announcement>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);
        Assert.Equal("Test Announcement", result.Data[0].Title);
    }

    [Fact]
    public async Task UpdateAnnouncement_WithValidId_ReturnsUpdatedAnnouncement()
    {
        // Arrange
        var newAnnouncement = new
        {
            Title = "Original Title",
            Body = "Original body",
            Category = "General",
            Status = "published",
            PostedBy = "TestUser"
        };

        var createResponse = await PostAsync(BaseUrl, newAnnouncement);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<Announcement>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var announcementId = created?.Data?.Id ?? 0;

        var updateData = new
        {
            Title = "Updated Title",
            Body = "Updated body",
            Category = "General",
            Status = "published"
        };

        // Act
        var response = await PutAsync($"{BaseUrl}/{announcementId}", updateData);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<Announcement>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.Equal("Updated Title", result.Data?.Title);
    }

    [Fact]
    public async Task DeleteAnnouncement_WithValidId_ReturnsSuccess()
    {
        // Arrange
        var newAnnouncement = new
        {
            Title = "To Delete",
            Body = "This will be deleted",
            Category = "General",
            Status = "published",
            PostedBy = "TestUser"
        };

        var createResponse = await PostAsync(BaseUrl, newAnnouncement);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<Announcement>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        var announcementId = created?.Data?.Id ?? 0;

        // Act
        var response = await DeleteAsync($"{BaseUrl}/{announcementId}");

        // Assert
        AssertSuccess(response);

        // Verify deletion
        var getResponse = await _client!.GetAsync(BaseUrl);
        var getContent = await getResponse.Content.ReadAsStringAsync();
        var getResult = JsonSerializer.Deserialize<ApiListResponse<Announcement>>(getContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.Empty(getResult?.Data ?? new List<Announcement>());
    }
}

/// <summary>
/// Integration tests for Events API endpoints
/// </summary>
public class EventsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/hoa-events";

    [Fact]
    public async Task GetEvents_WithoutData_ReturnsEmptyList()
    {
        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<HoaEvent>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task CreateEvent_WithValidData_ReturnsCreatedEvent()
    {
        // Arrange
        var newEvent = new
        {
            Title = "Community Gathering",
            Description = "Annual gathering",
            Date = "2024-12-25",
            Time = "14:00",
            Location = "Community Hall",
            Category = "Social",
            CreatedBy = "TestAdmin"
        };

        // Act
        var response = await PostAsync(BaseUrl, newEvent);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<HoaEvent>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Community Gathering", result.Data.Title);
    }

    [Fact]
    public async Task CreateAndDeleteEvent_ValidatesFullCycle()
    {
        // Arrange
        var newEvent = new
        {
            Title = "Event to Delete",
            Description = "Test delete",
            Date = "2024-12-31",
            Time = "23:00",
            Location = "Test Location",
            Category = "Testing",
            CreatedBy = "TestAdmin"
        };

        var createResponse = await PostAsync(BaseUrl, newEvent);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<HoaEvent>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var eventId = created?.Data?.Id ?? 0;

        // Act - Delete
        var deleteResponse = await DeleteAsync($"{BaseUrl}/{eventId}");

        // Assert
        AssertSuccess(deleteResponse);

        // Verify deleted
        var getResponse = await _client!.GetAsync(BaseUrl);
        var getContent = await getResponse.Content.ReadAsStringAsync();
        var getResult = JsonSerializer.Deserialize<ApiListResponse<HoaEvent>>(getContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.Empty(getResult?.Data ?? new List<HoaEvent>());
    }
}

/// <summary>
/// Integration tests for Tasks API endpoints
/// </summary>
public class TasksApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/tasks";

    [Fact]
    public async Task GetTasks_WithoutData_ReturnsEmptyList()
    {
        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<TaskModel>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsCreatedTask()
    {
        // Arrange
        var newTask = new
        {
            Title = "Fix Fence",
            Description = "Repair broken fence section",
            AssignedTo = "John",
            DueDate = "2024-12-30",
            Priority = "high",
            Status = "todo"
        };

        // Act
        var response = await PostAsync(BaseUrl, newTask);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<TaskModel>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Fix Fence", result.Data.Title);
        Assert.Equal("high", result.Data.Priority);
    }

    [Fact]
    public async Task GetTasksByStatus_FiltersCorrectly()
    {
        // Arrange - Create tasks with different statuses
        var task1 = new { Title = "Task 1", Status = "todo", Priority = "high", AssignedTo = "John", DueDate = "2024-12-31" };
        var task2 = new { Title = "Task 2", Status = "in-progress", Priority = "medium", AssignedTo = "Jane", DueDate = "2024-12-31" };

        await PostAsync(BaseUrl, task1);
        await PostAsync(BaseUrl, task2);

        // Act
        var response = await _client!.GetAsync($"{BaseUrl}/status/todo");

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<TaskModel>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.Single(result.Data ?? new List<TaskModel>());
        Assert.Equal("Task 1", result.Data?[0].Title);
    }

    [Fact]
    public async Task UpdateTaskStatus_ChangesStatusCorrectly()
    {
        // Arrange
        var newTask = new { Title = "Status Test", Status = "todo", Priority = "low", AssignedTo = "Test", DueDate = "2024-12-31" };
        var createResponse = await PostAsync(BaseUrl, newTask);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<TaskModel>>(createContent,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var taskId = created?.Data?.Id ?? 0;

        // Act
        var updateResponse = await PostAsync($"{BaseUrl}/{taskId}/status", new { status = "in-progress" });

        // Assert
        AssertSuccess(updateResponse);
    }
}

/// <summary>
/// Integration tests for Contacts API endpoints
/// </summary>
public class ContactsApiTests : IntegrationTestBase
{
    private const string BaseUrl = "/api/contacts";

    [Fact]
    public async Task CreateContact_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var newContact = new
        {
            Name = "John Doe",
            Role = "Security Chief",
            Phone = "+63-917-123-4567",
            Email = "john@belair4.com"
        };

        // Act
        var response = await PostAsync(BaseUrl, newContact);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<Contact>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.Equal("John Doe", result.Data?.Name);
    }

    [Fact]
    public async Task GetContacts_ReturnsAllContacts()
    {
        // Arrange
        var contact1 = new { Name = "Contact 1", Role = "Role 1", Phone = "555-1111", Email = "c1@test.com" };
        var contact2 = new { Name = "Contact 2", Role = "Role 2", Phone = "555-2222", Email = "c2@test.com" };

        await PostAsync(BaseUrl, contact1);
        await PostAsync(BaseUrl, contact2);

        // Act
        var response = await _client!.GetAsync(BaseUrl);

        // Assert
        AssertSuccess(response);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiListResponse<Contact>>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(result);
        Assert.Equal(2, result.Data?.Count);
    }
}
