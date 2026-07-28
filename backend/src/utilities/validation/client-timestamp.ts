import { ValidateBy, ValidationOptions, buildMessage } from "class-validator";

export const maxClientClockSkewMilliseconds = 5 * 60 * 1000;

export const IsClientTimestamp = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: "isClientTimestamp",
      validator: {
        validate: (value: unknown): boolean =>
          value instanceof Date &&
          !Number.isNaN(value.getTime()) &&
          value.getTime() <= Date.now() + maxClientClockSkewMilliseconds,
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix}$property must not be more than five minutes ahead of the server clock`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
