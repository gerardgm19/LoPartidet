using IdentityManager.Models;
using Xunit;
using IdentityManager.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;

namespace IdentityManager.Tests;

public class AuthServiceTests
{
    private static (Mock<UserManager<IdentityUser>> UserManager, IConfiguration Config) CreateDeps()
    {
        var store = new Mock<IUserStore<IdentityUser>>();
        var userManager = new Mock<UserManager<IdentityUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Jwt:Key"]).Returns("test-super-secret-key-for-unit-testing-32chars!!");
        config.Setup(c => c["Jwt:Issuer"]).Returns("test-issuer");
        config.Setup(c => c["Jwt:Audience"]).Returns("test-audience");

        return (userManager, config.Object);
    }

    // RegisterAsync

    [Fact]
    public async Task Register_Success_ReturnsAuthResponseWithUserIdAndToken()
    {
        var (userManagerMock, config) = CreateDeps();
        userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        var svc = new AuthService(userManagerMock.Object, config);
        var request = new RegisterRequest("test@test.com", "Password1!", "Test", "User", "tuser");

        var result = await svc.RegisterAsync(request);

        Assert.NotNull(result);
        Assert.NotEmpty(result.UserId);
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task Register_UserManagerFails_ThrowsInvalidOperationException()
    {
        var (userManagerMock, config) = CreateDeps();
        userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak." }));
        var svc = new AuthService(userManagerMock.Object, config);
        var request = new RegisterRequest("test@test.com", "weak", "Test", "User", "tuser");

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => svc.RegisterAsync(request));

        Assert.Contains("Password too weak.", ex.Message);
    }

    // LoginAsync

    [Fact]
    public async Task Login_UserNotFound_ReturnsNull()
    {
        var (userManagerMock, config) = CreateDeps();
        userManagerMock
            .Setup(um => um.FindByEmailAsync("notfound@test.com"))
            .ReturnsAsync((IdentityUser?)null);
        var svc = new AuthService(userManagerMock.Object, config);
        var request = new LoginRequest("notfound@test.com", "Password1!");

        var result = await svc.LoginAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsNull()
    {
        var (userManagerMock, config) = CreateDeps();
        var user = new IdentityUser { Id = "user-1", Email = "test@test.com", UserName = "test@test.com" };
        userManagerMock.Setup(um => um.FindByEmailAsync("test@test.com")).ReturnsAsync(user);
        userManagerMock.Setup(um => um.CheckPasswordAsync(user, "wrong-password")).ReturnsAsync(false);
        var svc = new AuthService(userManagerMock.Object, config);
        var request = new LoginRequest("test@test.com", "wrong-password");

        var result = await svc.LoginAsync(request);

        Assert.Null(result);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsAuthResponse()
    {
        var (userManagerMock, config) = CreateDeps();
        var user = new IdentityUser { Id = "user-1", Email = "test@test.com", UserName = "test@test.com" };
        userManagerMock.Setup(um => um.FindByEmailAsync("test@test.com")).ReturnsAsync(user);
        userManagerMock.Setup(um => um.CheckPasswordAsync(user, "Password1!")).ReturnsAsync(true);
        var svc = new AuthService(userManagerMock.Object, config);
        var request = new LoginRequest("test@test.com", "Password1!");

        var result = await svc.LoginAsync(request);

        Assert.NotNull(result);
        Assert.Equal("user-1", result.UserId);
        Assert.NotEmpty(result.Token);
    }
}
