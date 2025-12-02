import { PythonVisitorReturnValue } from "../python-ast-visitor-return-value";

export class UnexpectedResultError extends Error {
  constructor(message: string) {
    super(message);
  }

  public static unexpectedNonExpression(
    result: PythonVisitorReturnValue,
  ): UnexpectedResultError {
    return new UnexpectedResultError(
      `Expected expression node but received: ${JSON.stringify(result)}`,
    );
  }

  public static unexpectedNonExpressions(
    results: PythonVisitorReturnValue[],
  ): UnexpectedResultError {
    return new UnexpectedResultError(
      `Expected expression nodes but received: ${JSON.stringify(results)}`,
    );
  }
}
