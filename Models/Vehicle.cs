namespace PitStop.Models;

public record Vehicle(
    string Brand,
    string Model,
    string Engine,
    int Year,
    int Power,
    string Fuel,
    string KnownIssue,
    string IssueLevel);
