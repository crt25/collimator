export abstract class OtterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
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

/**
 * Thrown when the kernel that runs Otter could not be prepared (e.g. because
 * installing Otter failed) and no further attempts are made.
 * The error that made the last attempt fail is available as `cause`.
 */
export class OtterKernelPreparationError extends OtterError {
  constructor(
    public readonly attempts: number,
    cause: unknown,
  ) {
    const reason = cause instanceof Error ? cause.message : String(cause);

    super(
      `The Otter kernel could not be prepared after ${attempts} attempt(s): ${reason}`,
      { cause },
    );
  }
}
