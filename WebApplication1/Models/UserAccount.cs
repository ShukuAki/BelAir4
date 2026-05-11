using System;
using System.Collections.Generic;

namespace WebApplication1.Models;

public partial class UserAccount
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int Type { get; set; }
}
