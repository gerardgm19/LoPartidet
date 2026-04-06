using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public class UsersService(LoPartidetContext db) : IUsersService
{
    public User? GetById(string id) => db.Users.Find(id);

    public User CreateUser(CreateUserRequest request)
    {
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Surname = request.Surname,
            Nickname = request.Nickname,
            Email = request.Email,
            City = request.City,
            Birthday = request.Birthday,
            Position = request.Position,
            PreferredFoot = request.PreferredFoot,
            SkillLevel = request.SkillLevel,
            Speed = request.Speed,
            JerseyNumber = request.JerseyNumber,
            Height = request.Height,
        };

        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    public User? UpdateUser(string id, UpdateUserRequest request)
    {
        var user = db.Users.Find(id);
        if (user is null) return null;

        if (request.Name is not null) user.Name = request.Name;
        if (request.Surname is not null) user.Surname = request.Surname;
        if (request.Nickname is not null) user.Nickname = request.Nickname;
        if (request.Email is not null) user.Email = request.Email;
        if (request.City is not null) user.City = request.City;
        if (request.Birthday is not null) user.Birthday = request.Birthday;
        if (request.Position is not null) user.Position = request.Position;
        if (request.PreferredFoot is not null) user.PreferredFoot = request.PreferredFoot;
        if (request.SkillLevel is not null) user.SkillLevel = request.SkillLevel;
        if (request.Speed is not null) user.Speed = request.Speed;
        if (request.JerseyNumber is not null) user.JerseyNumber = request.JerseyNumber;
        if (request.Height is not null) user.Height = request.Height;

        db.SaveChanges();
        return user;
    }
}
