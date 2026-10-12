namespace PitStop.Models;

public record MaintenanceLog(
    string Date,
    string Vehicle,
    string Operation,
    string Part,
    decimal Cost,
    string Service);
