namespace PitStop.Models;

public record PartReview(
    string Part,
    string Type,
    string Vehicle,
    string Pros,
    string Cons,
    decimal Score);
