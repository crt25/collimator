export abstract class OtterError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class AssignNotebookFormatException extends OtterError {
  constructor(message: string) {
    super(message);
  }
}

export class CannotReadNotebookException extends OtterError {
  constructor(name: string) {
    super(`Cannot read notebook: ${name}`);
  }
}
