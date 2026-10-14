export default class PartReview {
  constructor(part, type, vehicle, pros, cons, score, supplier = '', priceRange = '', warranty = '', fitmentNote = '') {
    this.part = part;
    this.type = type;
    this.vehicle = vehicle;
    this.pros = pros;
    this.cons = cons;
    this.score = score;
    this.supplier = supplier;
    this.priceRange = priceRange;
    this.warranty = warranty;
    this.fitmentNote = fitmentNote;
  }
}
