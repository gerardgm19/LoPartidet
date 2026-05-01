using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class UsersService(LoPartidetContext db, IIdentityManagerService identityManagerService) : IUsersService
{
    public async Task<RegisterUserResponse?> RegisterUserAsync(RegisterUserDto request)
    {
        var identity = await identityManagerService.RegisterAsync(
            request.Name, request.Surname, request.Nickname, request.Email, request.Password);

        if (identity is null) return null;

        var user = new User
        {
            IdentityId = identity.UserId,
            Name = request.Name,
            Surname = request.Surname,
            Nickname = request.Nickname,
            Email = request.Email,
            City = request.City,
            Birthday = request.Birthday,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var playerSkill = new PlayerSkill
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Position = request.Position,
            PreferredFoot = request.PreferredFoot,
            SkillLevel = request.SkillLevel,
            Speed = request.Speed,
            JerseyNumber = request.JerseyNumber,
            Height = request.Height,
        };

        db.PlayerSkills.Add(playerSkill);
        await db.SaveChangesAsync();

        return new RegisterUserResponse(user.Id, identity.Token);
    }

    public User? GetById(int id) => db.Users.Find(id);

    public int GetUserIdByIdentityId(string identityId) =>
        db.Users.Where(u => u.IdentityId == identityId).Select(u => u.Id).FirstOrDefault();

    public User CreateUser(CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Surname = request.Surname,
            Nickname = request.Nickname,
            Email = request.Email,
            City = request.City,
            Birthday = request.Birthday,
        };

        db.Users.Add(user);
        db.SaveChanges();

        var playerSkill = new PlayerSkill
        {
            Id = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Position = request.Position,
            PreferredFoot = request.PreferredFoot,
            SkillLevel = request.SkillLevel,
            Speed = request.Speed,
            JerseyNumber = request.JerseyNumber,
            Height = request.Height,
        };

        db.PlayerSkills.Add(playerSkill);
        db.SaveChanges();

        return user;
    }

    public User? UpdateUser(int id, UpdateUserRequest request)
    {
        var user = db.Users.Include(u => u.PlayerSkills).FirstOrDefault(u => u.Id == id);
        if (user is null) return null;

        if (request.Name is not null) user.Name = request.Name;
        if (request.Surname is not null) user.Surname = request.Surname;
        if (request.Nickname is not null) user.Nickname = request.Nickname;
        if (request.Email is not null) user.Email = request.Email;
        if (request.City is not null) user.City = request.City;
        if (request.Birthday is not null) user.Birthday = request.Birthday.Value.ToDateTime(new TimeOnly(0, 0));

        var hasSkillFields = request.Position is not null || request.PreferredFoot is not null
            || request.SkillLevel is not null || request.Speed is not null
            || request.JerseyNumber is not null || request.Height is not null;

        if (hasSkillFields)
        {
            var skill = user.PlayerSkills.FirstOrDefault();
            if (skill is null)
            {
                skill = new PlayerSkill { Id = Guid.NewGuid().ToString(), UserId = user.Id };
                db.PlayerSkills.Add(skill);
            }

            if (request.Position is not null) skill.Position = request.Position;
            if (request.PreferredFoot is not null) skill.PreferredFoot = request.PreferredFoot;
            if (request.SkillLevel is not null) skill.SkillLevel = request.SkillLevel;
            if (request.Speed is not null) skill.Speed = request.Speed;
            if (request.JerseyNumber is not null) skill.JerseyNumber = request.JerseyNumber;
            if (request.Height is not null) skill.Height = request.Height;
        }

        db.SaveChanges();
        return user;
    }
}
