export class NoErrorThrownError extends Error {
  constructor() {
    super("Expected error to be thrown, but none was");
  }
}
