export class Duration {
  // Create new instances of the same class as static attributes
  static Instant = new Duration("d0");
  static Connection = new Duration("d1");
  static UntilCaught = new Duration("d2");
  static Forever = new Duration("d3");

  constructor(code) {
    this.code = code;
  }
}
