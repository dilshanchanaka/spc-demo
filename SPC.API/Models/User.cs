using SPC.API.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "supplier";
    public bool IsApproved { get; set; } = false;

    // Optional one-to-one
    public Supplier? Supplier { get; set; }
}
