export class Size {
  // Create new instances of the same class as static attributes
  static Local = new Size("l");
  static Global = new Size("g");

  constructor(code) {
    this.code = code;
  }
}
