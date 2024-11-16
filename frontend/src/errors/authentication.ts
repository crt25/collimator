export class AuthenticationError extends Error {
  readonly redirectPath: string;

  constructor(message: string, redirectPath: string) {
    super(message);
    this.redirectPath = redirectPath;
  }
}
