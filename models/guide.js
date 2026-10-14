export default class Guide {
  constructor(title, difficulty, duration, summary, steps = [], safetyNote = '') {
    this.title = title;
    this.difficulty = difficulty;
    this.duration = duration;
    this.summary = summary;
    this.steps = steps;
    this.safetyNote = safetyNote;
  }
}
