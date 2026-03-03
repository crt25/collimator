import { ArgumentMetadata, ValidationPipe } from "@nestjs/common";
import { AuthenticationProvider, UserType } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { ExistingUserDto } from "./existing-user.dto";

describe("ExistingUserDto", () => {
  const user = {
    id: 318,
    name: "Alice",
    email: "alice@example.com",
    oidcSub: null,
    authenticationProvider: AuthenticationProvider.MICROSOFT,
    type: UserType.TEACHER,
    publicKeyId: 123,
  };

  const target: ValidationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
  });

  const metadata: ArgumentMetadata = {
    type: "body",
    metatype: ExistingUserDto,
    data: "",
  };

  it("can be constructed", () => {
    const userDto = plainToInstance(ExistingUserDto, user);

    expect(userDto.id).toEqual(user.id);
    expect(userDto.name).toEqual(user.name);
    expect(userDto.email).toEqual(user.email);
    expect(userDto.oidcSub).toEqual(user.oidcSub);
    expect(userDto.authenticationProvider).toEqual(user.authenticationProvider);
    expect(userDto.type).toEqual(user.type);
  });

  it("validates valid DTO", async () => {
    await expect(
      target.transform(<ExistingUserDto>user, metadata),
    ).resolves.not.toThrow();
  });

  it.each([
    [
      "id",
      [
        "id should not be empty",
        "id must be a number conforming to the specified constraints",
      ],
    ],
    ["name", ["name should not be empty", "name must be a string"]],
    ["email", ["email should not be empty", "email must be an email"]],
    [
      "authenticationProvider",
      [
        "authenticationProvider should not be empty",
        "authenticationProvider must be one of the following values: MICROSOFT",
      ],
    ],
    [
      "type",
      [
        "type should not be empty",
        `type must be one of the following values: ${Object.values(UserType).join(", ")}`,
      ],
    ],
  ])("validate DTO missing field (%s)", async (field, errors) => {
    await target
      .transform(<ExistingUserDto>{ ...user, [field]: undefined }, metadata)
      .then(() => {
        console.error("Validation should fail!");
        expect(false).toBe(true);
      })
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toEqual(expect.arrayContaining(errors));
      });
  });

  it.each([
    [
      "id",
      "not_a_number",
      ["id must be a number conforming to the specified constraints"],
    ],
    [
      "name",
      123,
      [
        "name must be shorter than or equal to 100 characters",
        "name must be longer than or equal to 1 characters",
        "name must be a string",
      ],
    ],
    [
      "email",
      123,
      [
        "email must be shorter than or equal to 255 characters",
        "email must be an email",
        "email must be a string",
      ],
    ],
    ["oidcSub", 123, ["oidcSub must be a string"]],
    [
      "authenticationProvider",
      "xyz",
      ["authenticationProvider must be one of the following values: MICROSOFT"],
    ],
    [
      "type",
      "tomato",
      [
        `type must be one of the following values: ${Object.values(UserType).join(", ")}`,
      ],
    ],
    [
      "publicKeyId",
      "not_a_number",
      ["publicKeyId must be a number conforming to the specified constraints"],
    ],
  ])("validate DTO wrong field (%s)", async (field, value, errors) => {
    await target
      .transform(<ExistingUserDto>{ ...user, [field]: value }, metadata)
      .then(() => {
        console.error("Validation should fail!");
        expect(false).toBe(true);
      })
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toEqual(errors);
      });
  });
});
