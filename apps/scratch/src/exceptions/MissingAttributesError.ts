export class MissingAttributeError extends Error {
  constructor(
    public obj: unknown,
    public attributeName: string,
  ) {
    const objectType = obj?.constructor?.name || typeof obj;
    super(`Missing required attribute '${attributeName}' on ${objectType}`);

    this.name = "MissingAttributeError";
  }
}
