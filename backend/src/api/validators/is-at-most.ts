import { registerDecorator, ValidationOptions } from "class-validator";

export const IsAtMost =
  (otherProperty: string, validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string): void => {
    registerDecorator({
      name: "isAtMost",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [otherProperty],
      options: validationOptions,
      validator: {
        validate(value, args) {
          if (typeof value !== "number" || !args) {
            return false;
          }

          const [relatedPropertyName] = args.constraints;

          if (!(relatedPropertyName in args.object)) {
            return false;
          }

          const otherPropertyValue = args.object[relatedPropertyName];

          if (typeof otherPropertyValue !== "number") {
            return false;
          }

          return value <= otherPropertyValue;
        },
      },
    });
  };
