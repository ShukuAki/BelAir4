using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using WebApplication1;
using WebApplication1.Models;

namespace WebApplication1.Tests.Functional
{
    public class ApiControllerFunctionalTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ApiControllerFunctionalTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        #region Keyword API Tests

        [Fact]
        public async Task GetKeywords_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/api/keywords");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetActiveKeywords_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/api/keywords/active");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Forum API Tests

        [Fact]
        public async Task GetPosts_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/api/posts");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetPosts_ReturnsJsonContent()
        {
            // Act
            var response = await _client.GetAsync("/api/posts");

            // Assert
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        }

        #endregion

        #region Concern Report API Tests

        [Fact]
        public async Task GetConcernReports_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/api/concerns");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetConcernReports_ReturnsJsonContent()
        {
            // Act
            var response = await _client.GetAsync("/api/concerns");

            // Assert
            Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        }

        #endregion

        #region Page Route Tests

        [Fact]
        public async Task HomePage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task LoginPage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/login");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task RegisterPage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/register");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CommunityMapPage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/community-map");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task ForumsPage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/forums");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task ReportConcernsPage_ReturnsOkStatus()
        {
            // Act
            var response = await _client.GetAsync("/report-concerns");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public async Task InvalidRoute_ReturnsNotFound()
        {
            // Act
            var response = await _client.GetAsync("/nonexistent-page");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task InvalidApiEndpoint_ReturnsNotFound()
        {
            // Act
            var response = await _client.GetAsync("/api/nonexistent");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion
    }
}
