export default class MaintenanceLog {
  constructor(date, vehicle, operation, part, cost, service, id = null) {
    this.id = id;
    this.date = date;
    this.vehicle = vehicle;
    this.operation = operation;
    this.part = part;
    this.cost = cost;
    this.service = service;
  }
}
