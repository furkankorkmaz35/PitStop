export default class Vehicle {
  constructor(brand, model, engine, year, power, fuel, knownIssue, issueLevel) {
    this.brand = brand;
    this.model = model;
    this.engine = engine;
    this.year = year;
    this.power = power;
    this.fuel = fuel;
    this.knownIssue = knownIssue;
    this.issueLevel = issueLevel;
  }
}
