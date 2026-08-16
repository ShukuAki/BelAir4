using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Text;
using System.Text.Json;
using WebApplication1.Models;
using Xunit;

namespace WebApplication1.IntegrationTests;

/// <summary>
/// Base class for integration tests providing database setup and HTTP client
/// </summary>
public class IntegrationTestBase : IAsyncLifetime
{
    protected WebApplicationFactory<Program>? _factory;
    protected HttpClient? _client;
    protected SqBelAir4Context? _context;

    public virtual async Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove existing database provider
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<SqBelAir4Context>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Use in-memory database for testing
                    services.AddDbContext<SqBelAir4Context>(options =>
                    {
                        options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}");
                    });
                });
            });

        _client = _factory.CreateClient();

        // Get database context and initialize
        using var scope = _factory.Services.CreateScope();
        _context = scope.ServiceProvider.GetRequiredService<SqBelAir4Context>();

        // Ensure database is created
        await _context.Database.EnsureCreatedAsync();

        // Seed test data
        await SeedTestData();
    }

    public virtual async Task DisposeAsync()
    {
        if (_context != null)
        {
            await _context.Database.EnsureDeletedAsync();
            await _context.DisposeAsync();
        }
        _client?.Dispose();
        _factory?.Dispose();
    }

    /// <summary>
    /// Seed initial test data
    /// </summary>
    protected virtual async Task SeedTestData()
    {
        if (_context == null) return;

        // Seed keywords
        var keywords = new[]
        {
            new Keyword { Keyword1 = "damage", Severity = "high", Language = "English", Category = "property" },
            new Keyword { Keyword1 = "noise", Severity = "medium", Language = "English", Category = "disturbance" },
            new Keyword { Keyword1 = "parking", Severity = "low", Language = "English", Category = "parking" },
            new Keyword { Keyword1 = "sira", Severity = "high", Language = "Tagalog", Category = "property" },
            new Keyword { Keyword1 = "ingay", Severity = "medium", Language = "Tagalog", Category = "disturbance" }
        };

        _context.Keywords.AddRange(keywords);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Helper to make GET request and deserialize JSON response
    /// </summary>
    protected async Task<T?> GetAsync<T>(string url)
    {
        var response = await _client!.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    /// <summary>
    /// Helper to make POST request with JSON body
    /// </summary>
    protected async Task<HttpResponseMessage> PostAsync<T>(string url, T body)
    {
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await _client!.PostAsync(url, content);
    }

    /// <summary>
    /// Helper to make PUT request with JSON body
    /// </summary>
    protected async Task<HttpResponseMessage> PutAsync<T>(string url, T body)
    {
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await _client!.PutAsync(url, content);
    }

    /// <summary>
    /// Helper to make DELETE request
    /// </summary>
    protected async Task<HttpResponseMessage> DeleteAsync(string url)
    {
        return await _client!.DeleteAsync(url);
    }

    /// <summary>
    /// Assert response is successful (2xx status code)
    /// </summary>
    protected void AssertSuccess(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, $"Expected success but got {response.StatusCode}: {response.Content.ReadAsStringAsync().Result}");
    }

    /// <summary>
    /// Assert response has specific status code
    /// </summary>
    protected void AssertStatusCode(HttpResponseMessage response, HttpStatusCode expected)
    {
        Assert.Equal(expected, response.StatusCode);
    }
}

/// <summary>
/// Response wrapper for API responses
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// List response wrapper
/// </summary>
public class ApiListResponse<T>
{
    public bool Success { get; set; }
    public List<T>? Data { get; set; }
    public string? Message { get; set; }
}
