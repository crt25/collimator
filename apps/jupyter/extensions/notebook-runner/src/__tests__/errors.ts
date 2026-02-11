export class NoErrorThrownError extends Error {
  constructor() {
    super("Expected error to be thrown, but none was");
  }
}

export class NoCallbacksConnectedError extends Error {
  constructor() {
    super("Expected callbacks to be connected, but none were");
  }
}
