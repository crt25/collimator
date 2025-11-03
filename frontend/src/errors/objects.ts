export class ObjectMustNotBeNullorUndefinedError extends Error {
  constructor(objectName: string) {
    super(`${objectName} must not be null or undefined.`);
  }
}

export class ObjectMustNotBeUndefinedError extends Error {
  constructor(objectName: string) {
    super(`${objectName} must not be undefined.`);
  }
}

export class ObjectMustNotBeNullError extends Error {
  constructor(objectName: string) {
    super(`${objectName} must not be null.`);
  }
}
