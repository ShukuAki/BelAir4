using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using WebApplication1;
using WebApplication1.Models;

namespace WebApplication1.Tests.EndToEnd
{
    public class UserWorkflowE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public UserWorkflowE2ETests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        #region Forum Workflow Tests

        [Fact]
        public async Task ForumWorkflow_ViewPostsAndGetPosts()
        {
            // Step 1: Navigate to forums page
            var pageResponse = await _client.GetAsync("/forums");
            Assert.Equal(HttpStatusCode.OK, pageResponse.StatusCode);

            // Step 2: Get all posts via API
            var postsResponse = await _client.GetAsync("/api/posts");
            Assert.Equal(HttpStatusCode.OK, postsResponse.StatusCode);
            Assert.Equal("application/json", postsResponse.Content.Headers.ContentType?.MediaType);
        }

        #endregion

        #region Concern Reporting Workflow Tests

        [Fact]
        public async Task ConcernReportingWorkflow_AccessFormAndGetReports()
        {
            // Step 1: Navigate to report concerns page
            var pageResponse = await _client.GetAsync("/report-concerns");
            Assert.Equal(HttpStatusCode.OK, pageResponse.StatusCode);

            // Step 2: Fetch existing reports
            var reportsResponse = await _client.GetAsync("/api/concerns");
            Assert.Equal(HttpStatusCode.OK, reportsResponse.StatusCode);
            Assert.Equal("application/json", reportsResponse.Content.Headers.ContentType?.MediaType);
        }

        #endregion

        #region Reservation Workflow Tests

        [Fact]
        public async Task ReservationWorkflow_AccessReservationPage()
        {
            // Step 1: Navigate to reservation page
            var response = await _client.GetAsync("/reserve");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Navigation Workflow Tests

        [Fact]
        public async Task NavigationWorkflow_VisitAllMainPages()
        {
            // Test all major pages are accessible
            var pages = new[]
            {
                "/",
                "/about",
                "/announcement",
                "/calendars",
                "/contacts",
                "/forums",
                "/landmarks",
                "/community-map",
                "/reserve"
            };

            foreach (var page in pages)
            {
                var response = await _client.GetAsync(page);
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            }
        }

        #endregion

        #region API Integration Tests

        [Fact]
        public async Task ApiIntegration_KeywordEndpoints()
        {
            // Test keyword endpoints
            var response = await _client.GetAsync("/api/keywords");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var activeResponse = await _client.GetAsync("/api/keywords/active");
            Assert.Equal(HttpStatusCode.OK, activeResponse.StatusCode);
        }

        #endregion

        #region Authentication Flow Tests

        [Fact]
        public async Task AuthenticationFlow_AccessLoginPage()
        {
            // Step 1: Access login page
            var response = await _client.GetAsync("/login");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task AuthenticationFlow_AccessRegisterPage()
        {
            // Step 1: Access register page
            var response = await _client.GetAsync("/register");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion
    }

    public class CommunityMapE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public CommunityMapE2ETests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CommunityMap_PageLoadsSuccessfully()
        {
            // Act
            var response = await _client.GetAsync("/community-map");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CommunityMap_CanFetchConcernReportsForMap()
        {
            // Act
            var response = await _client.GetAsync("/api/concerns");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    public class VehiclePetRegistrationE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public VehiclePetRegistrationE2ETests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task VehiclePetRegistration_PageLoadsSuccessfully()
        {
            // Act
            var response = await _client.GetAsync("/vehicle-pet-registration");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    public class AdvertisementsE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AdvertisementsE2ETests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Advertisements_PageLoadsSuccessfully()
        {
            // Act
            var response = await _client.GetAsync("/advertisements");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    public class AnnouncementsE2ETests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AnnouncementsE2ETests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Announcements_PageLoadsSuccessfully()
        {
            // Act
            var response = await _client.GetAsync("/announcement");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
