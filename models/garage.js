export default class Garage {
  constructor(name, city, specialty, brands, score, address = '', hours = '', services = [], priceLevel = '', ratingCount = 0) {
    this.name = name;
    this.city = city;
    this.specialty = specialty;
    this.brands = brands;
    this.score = score;
    this.address = address;
    this.hours = hours;
    this.services = services;
    this.priceLevel = priceLevel;
    this.ratingCount = ratingCount;
  }
}
