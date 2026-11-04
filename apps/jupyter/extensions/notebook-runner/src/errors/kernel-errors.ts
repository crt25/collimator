/**
 * Thrown when code executed in a kernel raises a Python exception.
 */
export class PythonExecutionError extends Error {
  constructor(
    public readonly ename: string,
    public readonly evalue: string,
  ) {
    super(`Error executing code: ${ename}: ${evalue}`);
    this.name = new.target.name;
  }
}
