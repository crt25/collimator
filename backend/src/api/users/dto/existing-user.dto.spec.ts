import { ArgumentMetadata, ValidationPipe } from "@nestjs/common";
import { UserType } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { ExistingUserDto } from "./existing-user.dto";

describe("ExistingUserDto", () => {
  const user = {
    id: 318,
    name: "Alice",
    email: "alice@example.com",
    type: UserType.TEACHER,
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
      "id must be a number conforming to the specified constraints",
    ],
    ["name", 123, "name must be a string"],
    ["email", "not_an_email", "email must be an email"],
    [
      "type",
      "tomato",
      `type must be one of the following values: ${Object.values(UserType).join(", ")}`,
    ],
  ])("validate DTO wrong field (%s)", async (field, value, error) => {
    await target
      .transform(<ExistingUserDto>{ ...user, [field]: value }, metadata)
      .then(() => {
        console.error("Validation should fail!");
        expect(false).toBe(true);
      })
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toEqual([error]);
      });
  });
});
