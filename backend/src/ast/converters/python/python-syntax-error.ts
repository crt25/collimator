export interface PythonSyntaxErrorDetail {
  line: number;
  column: number;
  message: string;
}

/**
 * Thrown when the input is not valid Python. Without this, a syntax error
 * either crashed the conversion with an uncontrolled TypeError (a parse-error
 * recovery tree leaves mandatory children null) or - worse - silently
 * converted into a garbage AST that polluted the similarity analysis.
 */
export class PythonSyntaxError extends Error {
  constructor(readonly errors: PythonSyntaxErrorDetail[]) {
    super(
      `Input is not valid Python: ${errors
        .map((e) => `line ${e.line}:${e.column} ${e.message}`)
        .join("; ")}`,
    );
    this.name = "PythonSyntaxError";
  }
}
